import cron from "node-cron";
import { EmbedBuilder } from "discord.js";
import { fetchDevfolioHackathons } from "./fetchers/devfolio.js";
import fetchUnstopHackathons from "./fetchers/unstop.js";
import fetchMLHHackathons from "./fetchers/mlh.js";
import { isNewHackathon, markHackathonAsSeen } from "./storage/dedup.js";
import { getAllGuildChannels } from "./storage/guildConfig.js";

let lastSummaryTime = Date.now();

// Monitoring state
const monitorState = {
    lastScanTime: "Never",
    status: "Idle",
    lastFetchCount: 0,
    platforms: {}
};

export function getMonitorState() {
    return monitorState;
}

export function initCron(client) {
    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Hourly scan started...");

        try {
            const guildChannels = getAllGuildChannels();
            const guildIds = Object.keys(guildChannels);

            if (guildIds.length === 0) {
                console.warn("⚠️ No configured guilds found. Skipping scan.");
                return;
            }

            // 1. Fetch & Normalize
            monitorState.status = "Fetching...";
            monitorState.platforms = {};

            const [devfolio, unstop, mlh] = await Promise.all([
                fetchDevfolioHackathons().then(d => { monitorState.platforms.Devfolio = "✅ OK"; return d; }).catch(e => { monitorState.platforms.Devfolio = "❌ Error"; return []; }),
                fetchUnstopHackathons().then(d => { monitorState.platforms.Unstop = "✅ OK"; return d; }).catch(e => { monitorState.platforms.Unstop = "❌ Error"; return []; }),
                fetchMLHHackathons().then(d => { monitorState.platforms.MLH = "✅ OK"; return d; }).catch(e => { monitorState.platforms.MLH = "❌ Error"; return []; })
            ]);

            const allHackathons = [...devfolio, ...unstop, ...mlh];
            const normalizedHackathons = allHackathons.filter(h => h && h.id && h.title);

            // 2. Identify NEW items globally
            const newHackathons = [];
            for (const h of normalizedHackathons) {
                if (isNewHackathon(h.id)) {
                    newHackathons.push(h);
                }
            }

            if (newHackathons.length === 0) {
                console.log("✅ No new hackathons found globally.");
            } else {
                console.log(`🔥 Found ${newHackathons.length} NEW hackathons! Sending alerts...`);

                // 3. Mark them as seen NOW (store safely)
                // We mark them seen so they aren't processed again in the next hour if this loop crashes.
                // However, if we mark them seen before sending, and sending fails, we miss alerts.
                // Best practice for simple bot: Send first, then mark.
                // But since we have multiple guilds, one guild failure shouldn't stop marking for others.
                // We will mark them at the end of the batch.

                // 4. Distribute to Guilds
                for (const guildId of guildIds) {
                    const channelId = guildChannels[guildId];
                    let sentCount = 0;

                    try {
                        const channel = await client.channels.fetch(channelId);
                        if (!channel) continue;

                        for (const hackathon of newHackathons) {
                            // Rate Limit Check
                            if (sentCount >= 5) {
                                await channel.send("⚠️ More hackathons found. Use `/latest` to view all.");
                                break;
                            }

                            // Send Message
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

                                if (hackathon.image) embed.setImage(hackathon.image);
                                await channel.send({ embeds: [embed] });

                            } else {
                                const message =
                                    `🏆 Hackathon Alert\n` +
                                    `📌 ${hackathon.title}\n` +
                                    `🌐 Platform: ${hackathon.platform}\n` +
                                    `🔗 ${hackathon.url}`;
                                await channel.send(message);
                            }

                            sentCount++;
                        }
                    } catch (err) {
                        console.error(`❌ Failed to send to guild ${guildId}: ${err.message}`);
                    }
                }

                // 5. Mark seen globally
                for (const h of newHackathons) {
                    markHackathonAsSeen(h);
                }
                console.log(`✅ Marked ${newHackathons.length} items as seen.`);
            }

            // 6. Summary Log
            const ONE_HOUR = 60 * 60 * 1000;
            if (Date.now() - lastSummaryTime >= ONE_HOUR) {
                console.log("✅ Hourly cycle complete. Bot is healthy.");
                lastSummaryTime = Date.now();
            }

            monitorState.lastScanTime = new Date().toLocaleString();
            monitorState.lastFetchCount = normalizedHackathons.length;
            monitorState.status = "Online & Idle";

        } catch (error) {
            console.error("❌ Critical Cron Error:", error);
            monitorState.status = "Critical Error: " + error.message;
        }
    });
}
