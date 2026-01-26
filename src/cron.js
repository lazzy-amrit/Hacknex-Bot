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

// Logic extracted for manual execution
export async function runHackathonCycle(client, options = {}) {
    console.log("⏰ Hackathon scan cycle started...");
    monitorState.status = "Fetching...";
    if (!options.platform) monitorState.platforms = {};

    const summary = {
        totalFetched: 0,
        newFound: 0,
        errors: []
    };

    try {
        const guildChannels = getAllGuildChannels();
        const guildIds = Object.keys(guildChannels);

        if (guildIds.length === 0) {
            console.warn("⚠️ No configured guilds found. Skipping scan.");
            return summary;
        }

        // 1. Fetch
        const fetchPromises = [];

        // Conditional fetching based on options.platform
        const shouldFetch = (p) => !options.platform || options.platform.toLowerCase() === p.toLowerCase();

        if (shouldFetch('Devfolio')) {
            fetchPromises.push(fetchDevfolioHackathons().then(d => { monitorState.platforms.Devfolio = "✅ OK"; return d; }).catch(e => { monitorState.platforms.Devfolio = "❌ Error"; summary.errors.push(`Devfolio: ${e.message}`); return []; }));
        } else { fetchPromises.push(Promise.resolve([])); }

        if (shouldFetch('Unstop')) {
            fetchPromises.push(fetchUnstopHackathons().then(d => { monitorState.platforms.Unstop = "✅ OK"; return d; }).catch(e => { monitorState.platforms.Unstop = "❌ Error"; summary.errors.push(`Unstop: ${e.message}`); return []; }));
        } else { fetchPromises.push(Promise.resolve([])); }

        if (shouldFetch('MLH')) {
            fetchPromises.push(fetchMLHHackathons().then(d => { monitorState.platforms.MLH = "✅ OK"; return d; }).catch(e => { monitorState.platforms.MLH = "❌ Error"; summary.errors.push(`MLH: ${e.message}`); return []; }));
        } else { fetchPromises.push(Promise.resolve([])); }

        const [devfolio, unstop, mlh] = await Promise.all(fetchPromises);

        const allHackathons = [...devfolio, ...unstop, ...mlh];
        const normalizedHackathons = allHackathons.filter(h => h && h.id && h.title);
        summary.totalFetched = normalizedHackathons.length;

        // 2. Identify NEW items
        const newHackathons = [];
        for (const h of normalizedHackathons) {
            if (isNewHackathon(h.id)) {
                newHackathons.push(h);
            }
        }
        summary.newFound = newHackathons.length;

        if (newHackathons.length === 0) {
            console.log("✅ No new hackathons found globally.");
        } else {
            console.log(`🔥 Found ${newHackathons.length} NEW hackathons! Sending alerts...`);

            // 3. Mark seen (deferred till end usually, but we do it after send attempt loop)

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

        // Update monitor state
        monitorState.lastScanTime = new Date().toLocaleString();
        monitorState.lastFetchCount = normalizedHackathons.length;
        monitorState.status = "Online & Idle";

    } catch (error) {
        console.error("❌ Critical Cycle Error:", error);
        monitorState.status = "Critical Error: " + error.message;
        summary.errors.push(error.message);
    }

    return summary;
}

export function initCron(client) {
    cron.schedule("0 * * * *", async () => {
        // Run full cycle
        const summary = await runHackathonCycle(client);

        // Log hourly summary
        const ONE_HOUR = 60 * 60 * 1000;
        if (Date.now() - lastSummaryTime >= ONE_HOUR) {
            console.log("✅ Hourly cycle complete. Bot is healthy.");
            lastSummaryTime = Date.now();
        }
    });
}
