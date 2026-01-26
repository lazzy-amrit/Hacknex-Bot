import { Events, REST, Routes, InteractionType, EmbedBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { getLatestHackathons, getSeenHackathonsCount } from "./storage/dedup.js";
import { setGuildChannel, getGuildChannel, getAllGuildChannels } from "./storage/guildConfig.js";

import { fetchDevfolioHackathons } from "./fetchers/devfolio.js";
import fetchUnstopHackathons from "./fetchers/unstop.js";
import fetchMLHHackathons from "./fetchers/mlh.js";
import { getMonitorState } from "./cron.js";

import dotenv from "dotenv";
import client from "./client.js";
import { initCron } from "./cron.js";

// Load environment variables
dotenv.config();

// Initialize Cron Jobs
// moved to client.once(ready)

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🚀 Hacknex Bot is online as ${readyClient.user.tag}`);

    // Initialize Cron Jobs
    initCron(client);



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
                    name: 'health',
                    description: 'Check bot health and cron status',
                },
                {
                    name: 'stats',
                    description: 'Show total tracked hackathons and server count',
                },
                {
                    name: 'testscan',
                    description: 'Run a test fetch cycle without saving data (Admin Only)',
                },
                {
                    name: 'testalert',
                    description: 'Send a test hackathon alert to this channel (Admin Only)',
                },
                {
                    name: 'setup',
                    description: 'Configure Hacknex to use a specific channel (Admins only)',
                    options: [{
                        name: 'channel',
                        description: 'The text channel to post alerts in',
                        type: 7, // ChannelType.GuildText is difficult to pass in raw JSON via REST sometimes without types, 7 is standard CHANNEL type generally, but for specific subset often 0 or integers used.
                        // Actually, better to simply let user pick any channel and validate in code.
                        // Discord.js REST helper simplifies this but here we are sending raw body.
                        // Type 7 is CHANNEL.
                        type: 7,
                        required: true,
                    }]
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
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "❌ You must be a server administrator to configure Hacknex", ephemeral: true });
            return;
        }

        const channel = interaction.options.getChannel('channel');

        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: "❌ Please select a valid Text Channel.", ephemeral: true });
            return;
        }

        const guildId = interaction.guildId;
        if (guildId) {
            setGuildChannel(guildId, channel.id);
            await interaction.reply(`✅ Hacknex will post hackathons in ${channel.toString()}`);
        } else {
            await interaction.reply({ content: "❌ Error: Could not determine server ID.", ephemeral: true });
        }
        return;
    }

    if (interaction.commandName === 'latest') {
        const guildId = interaction.guildId;
        const configuredChannelId = guildId ? getGuildChannel(guildId) : null;

        if (guildId && !configuredChannelId) {
            await interaction.reply({ content: "⚠️ Run `/setup` to configure a channel first!", ephemeral: true });
            return;
        }

        const latest = getLatestHackathons(5);
        if (latest.length === 0) {
            await interaction.reply("No hackathons found yet!");
            return;
        }

        const embeds = latest.map(h => {
            const embed = new EmbedBuilder()
                .setTitle("🏆 " + h.title)
                .addFields(
                    { name: "Platform", value: h.platform, inline: true },
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

    if (interaction.commandName === 'health') {
        const state = getMonitorState();
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);

        const embed = new EmbedBuilder()
            .setTitle("🏥 Bot Health Status")
            .addFields(
                { name: "Status", value: state.status, inline: true },
                { name: "Last Scan", value: state.lastScanTime, inline: true },
                { name: "Last Fetch Count", value: `${state.lastFetchCount}`, inline: true },
                { name: "Uptime", value: `${uptimeHours}h ${uptimeMinutes}m`, inline: true },
                { name: "Platform Status", value: Object.entries(state.platforms).map(([k, v]) => `${k}: ${v}`).join("\n") || "No data yet" }
            )
            .setColor(0x00FF00); // Green

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.commandName === 'stats') {
        const seenCount = getSeenHackathonsCount();
        const guilds = Object.keys(getAllGuildChannels()).length;

        const embed = new EmbedBuilder()
            .setTitle("📊 Hacknex Stats")
            .addFields(
                { name: "Total Hackathons Tracked", value: `${seenCount}`, inline: true },
                { name: "Active Servers", value: `${guilds}`, inline: true }
            )
            .setColor(0xFFA500); // Orange

        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'testscan') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "❌ You must be a server administrator to use this command", ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const [devfolio, unstop, mlh] = await Promise.all([
                fetchDevfolioHackathons(),
                fetchUnstopHackathons(),
                fetchMLHHackathons()
            ]);

            const total = devfolio.length + unstop.length + mlh.length;
            const valid = [...devfolio, ...unstop, ...mlh].filter(h => h && h.id && h.title).length;

            const embed = new EmbedBuilder()
                .setTitle("🧪 Test Scan Results")
                .setDescription("Fetched data from all sources directly (No storage save).")
                .addFields(
                    { name: "Total Fetched", value: `${total}`, inline: true },
                    { name: "Valid/Normalized", value: `${valid}`, inline: true },
                    { name: "Breakdown", value: `Devfolio: ${devfolio.length}\nUnstop: ${unstop.length}\nMLH: ${mlh.length}` }
                )
                .setColor(0x0099ff);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ Scan failed: " + error.message);
        }
    }

    if (interaction.commandName === 'testalert') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "❌ You must be a server administrator to use this command", ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("🧪 TEST ALERT: Hackathon Name")
            .setDescription("**This is a test alert generated by an admin.**")
            .addFields(
                { name: "Platform", value: "TestPlatform", inline: true },
                { name: "Link", value: `[Click Here](https://example.com)`, inline: true }
            )
            .setColor(0x0099ff)
            .setFooter({ text: "Hacknex • Test Mode" })
            .setTimestamp();

        // Send to current channel (not configured channel, for safety/testing where command is run)
        // Or should it obey configured channel? Request says "Sends a fake hackathon embed to configured channel"
        // Let's check config.

        const guildId = interaction.guildId;
        const channelId = guildId ? getGuildChannel(guildId) : null;

        if (!channelId) {
            await interaction.reply({ content: "⚠️ No channel configured yet. Run `/setup` first.", ephemeral: true });
            return;
        }

        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send({ embeds: [embed] });
                await interaction.reply({ content: `✅ Test alert sent to ${channel.toString()}`, ephemeral: true });
            } else {
                await interaction.reply({ content: "❌ Configured channel not found.", ephemeral: true });
            }
        } catch (err) {
            await interaction.reply({ content: "❌ Failed to send: " + err.message, ephemeral: true });
        }
    }
});

client.on(Events.GuildCreate, async (guild) => {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);

    // Find a channel to send the welcome message
    // 1. Try system channel
    // 2. Try first writable text channel
    let channel = guild.systemChannel;

    if (!channel || !channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
        channel = guild.channels.cache.find(c =>
            c.type === ChannelType.GuildText &&
            c.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
        );
    }

    if (channel) {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle("👋 Thanks for adding Hacknex!")
            .setDescription(
                "I'm here to send you the latest hackathon alerts.\n\n" +
                "**To get started:**\n" +
                "1️⃣ Run `/setup` and choose a text channel for alerts.\n" +
                "2️⃣ Use `/latest` to see what's happening right now.\n\n" +
                "Happy hacking! 🚀"
            )
            .setColor(0x0099ff);

        try {
            await channel.send({ embeds: [welcomeEmbed] });
            console.log(`Sent welcome message to ${guild.name}`);
        } catch (err) {
            console.error(`Failed to send welcome to ${guild.name}:`, err.message);
        }
    } else {
        console.warn(`Could not find a writable channel to welcome guild ${guild.id}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
