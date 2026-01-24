import { Events } from "discord.js";
import dotenv from "dotenv";
import client from "./client.js";
import { initCron } from "./cron.js";

// Load environment variables
dotenv.config();

// Initialize Cron Jobs
initCron(client);

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🚀 Hacknex Bot is online as ${readyClient.user.tag}`);

    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
        console.log("Please set DISCORD_CHANNEL_ID in .env to send a startup message.");
        return;
    }

    try {
        const channel = await readyClient.channels.fetch(channelId);
        if (channel) {
            await channel.send("🚀 Hacknex Bot is live!");
        } else {
            console.log("Channel not found.");
        }
    } catch (error) {
        console.error("Error fetching channel:", error);
    }
});

client.login(process.env.DISCORD_TOKEN);
