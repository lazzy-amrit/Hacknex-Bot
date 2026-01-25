import { Events, REST, Routes, InteractionType, EmbedBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { getLatestHackathons } from "./storage/dedup.js";

import { saveGuildChannel, setGuildChannel } from "./storage/guildChannels.js";
import dotenv from "dotenv";
import client from "./client.js";
import { initCron } from "./cron.js";

// Load environment variables
dotenv.config();

// Initialize Cron Jobs
initCron(client);

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🚀 Hacknex Bot is online as ${readyClient.user.tag}`);

    // Migrate legacy .env channel if exists
    const legacyChannelId = process.env.DISCORD_CHANNEL_ID;
    if (legacyChannelId) {
        try {
            const channel = await readyClient.channels.fetch(legacyChannelId);
            if (channel && channel.guild) {
                saveGuildChannel(channel.guild.id, channel.id);
                console.log(`✅ Migrated legacy channel ${channel.id} for guild ${channel.guild.id}`);
            }
        } catch (error) {
            console.warn("Legacy channel migration failed or already handled:", error.message);
        }
    } else {
        console.log("No legacy DISCORD_CHANNEL_ID found. Detection mode active.");
    }

    // Register Slash Commands
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(readyClient.user.id),
            {
                body: [{
                    name: 'latest',
                    description: 'Show the latest hackathons tracked by Hacknex',
                },
                {
                    name: 'setup',
                    description: 'Configure Hacknex to use this channel (Admins only)',
                }]
            },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        // Check for Administrator permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "❌ You need Administrator permissions to use this command.", ephemeral: true });
            return;
        }

        const channelId = interaction.channelId;
        const guildId = interaction.guildId;

        if (channelId && guildId) {
            setGuildChannel(guildId, channelId);
            await interaction.reply("✅ Hacknex configured for this server. Alerts will appear here.");
        } else {
            await interaction.reply({ content: "❌ Could not determine channel details.", ephemeral: true });
        }
        return;
    }

    if (interaction.commandName === 'latest') {
        const latest = getLatestHackathons(5);
        if (latest.length === 0) {
            await interaction.reply("No hackathons found yet!");
            return;
        }

        const embeds = latest.map(h => {
            const embed = new EmbedBuilder()
                .setTitle("🏆 " + (h.title || "Untitled Hackathon"))
                .addFields(
                    { name: "Platform", value: h.platform || "Unknown", inline: true },
                    { name: "Link", value: `[Click Here](${h.url})`, inline: true }
                )
                .setColor(0x0099ff);

            if (h.image) {
                embed.setImage(h.image);
            }
            return embed;
        });

        await interaction.reply({ content: "Here are the latest hackathons found:", embeds: embeds });
    }
});

client.on(Events.GuildCreate, async (guild) => {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);

    // Find first text channel where we can send messages
    const channel = guild.channels.cache.find(c =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
    );

    if (channel) {
        saveGuildChannel(guild.id, channel.id);
        await channel.send("👋 Hacknex Bot is live! I’ll post new hackathons here automatically.");
        console.log(`Saved default channel ${channel.id} for guild ${guild.id}`);
    } else {
        console.warn(`Could not find a writable text channel in guild ${guild.id}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
