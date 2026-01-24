import cron from "node-cron";

export function initCron(client) {
    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Hacknex cron job running (every 1 hour)");

        try {
            const channelId = process.env.DISCORD_CHANNEL_ID;
            if (channelId) {
                const channel = await client.channels.fetch(channelId);
                if (channel) {
                    await channel.send("⏰ Hacknex hourly check completed");
                } else {
                    console.error("Cron Error: Channel not found.");
                }
            } else {
                console.warn("Cron Warning: DISCORD_CHANNEL_ID not set.");
            }
        } catch (error) {
            console.error("Cron Error:", error);
        }
    });
}
