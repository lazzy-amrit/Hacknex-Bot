import cron from "node-cron";
import { EmbedBuilder } from "discord.js";
import { fetchDevfolioHackathons } from "./fetchers/devfolio.js";
import fetchUnstopHackathons from "./fetchers/unstop.js";
import fetchMLHHackathons from "./fetchers/mlh.js";
import { isNewHackathon, markHackathonAsSeen } from "./storage/dedup.js";

import { getAllGuilds } from "./storage/guildChannels.js";

// State to track if we posted anything this hour
// State to track if we posted anything this hour
let postedInThisHour = false;
let lastSummaryTime = Date.now(); // Track when we last sent a summary

export function initCron(client) {
    // Runs every hour at minute 0
    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Hacknex hourly scan started");

        // Reset state at start of hour (actually we want to reset AFTER sending the "No new" message?
        // User rules: "At the END... If postedInThisHour === false... Send... Then reset".
        // So we interpret "this hour" as "since the last check".
        postedInThisHour = false;

        try {
            const channelsMap = getAllGuilds();
            const channelIds = Object.values(channelsMap);

            if (channelIds.length === 0) {
                console.warn("Cron Warning: No guild channels saved.");
                return;
            }

            // Fetch from all sources
            console.log("Fetching Devfolio hackathons...");
            const devfolioHackathons = await fetchDevfolioHackathons();

            console.log("Fetching Unstop hackathons...");
            const unstopHackathons = await fetchUnstopHackathons();

            console.log("Fetching MLH hackathons...");
            const mlhHackathons = await fetchMLHHackathons();

            console.log(
                `Fetched ${devfolioHackathons.length} from Devfolio, ${unstopHackathons.length} from Unstop, ${mlhHackathons.length} from MLH`
            );

            const allHackathons = [
                ...devfolioHackathons,
                ...unstopHackathons,
                ...mlhHackathons
            ];

            const normalizedHackathons = allHackathons.map(h => ({
                title: h.title || h.name || "Untitled Hackathon",
                url: h.url || h.link,
                platform: h.platform || "Unknown",
                image: h.image
            }));

            console.log("✅ Normalized hackathons:", normalizedHackathons.length);

            if (normalizedHackathons.length === 0) {
                console.log("⚠️ All sources failed this scan — skipping");
                return;
            }

            let newCount = 0;

            for (const hackathon of normalizedHackathons) {
                if (isNewHackathon(hackathon.url)) {
                    // Send to ALL channels
                    for (const chId of channelIds) {
                        try {
                            const channel = await client.channels.fetch(chId);
                            if (!channel) continue;

                            if (hackathon.platform === "Unstop") {
                                const embed = new EmbedBuilder()
                                    .setTitle("🏆 Hackathon Alert")
                                    .setDescription(`**${hackathon.title}**`)
                                    .addFields(
                                        { name: "Platform", value: hackathon.platform, inline: true },
                                        { name: "Link", value: `[Click Here](${hackathon.url})`, inline: true }
                                    )
                                    .setColor(0x0099ff)
                                    .setFooter({ text: "Hacknex • Auto-updated hourly" })
                                    .setTimestamp();

                                if (hackathon.image) {
                                    embed.setImage(hackathon.image);
                                }

                                await channel.send({ embeds: [embed] });
                            } else {
                                const message =
                                    `🏆 Hackathon Alert\n` +
                                    `📌 ${hackathon.title}\n` +
                                    `🌐 Platform: ${hackathon.platform}\n` +
                                    `🔗 ${hackathon.url}`;

                                await channel.send(message);
                            }
                        } catch (err) {
                            console.error(`Failed to send to channel ${chId}:`, err.message);
                        }
                    }

                    markHackathonAsSeen(hackathon);
                    newCount++;
                }
            }

            if (newCount > 0) {
                postedInThisHour = true;
            }

            // Check if 1 hour has passed since last summary
            const ONE_HOUR = 60 * 60 * 1000;
            if (Date.now() - lastSummaryTime >= ONE_HOUR) {
                if (!postedInThisHour) {
                    for (const chId of channelIds) {
                        try {
                            const channel = await client.channels.fetch(chId);
                            if (channel) {
                                await channel.send("✅ No new hackathons found in the last hour");
                            }
                        } catch (err) { console.error(err.message); }
                    }
                }

                // Reset state after hour boundary
                postedInThisHour = false;
                lastSummaryTime = Date.now();
            }

        } catch (error) {
            console.error("Cron Error:", error);
        }
    });
}
