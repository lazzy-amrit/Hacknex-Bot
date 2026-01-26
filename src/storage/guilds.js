import fs from 'fs';
import path from 'path';

// Using src/storage/guilds.json to keep data persistent and clean
const STORAGE_FILE = path.join(process.cwd(), 'src/storage/guilds.json');

function loadGuilds() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            fs.writeFileSync(STORAGE_FILE, '{}');
            return {};
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading guilds:", error);
        return {};
    }
}

function saveGuilds(data) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving guilds:", error);
    }
}

export function getAllGuilds() {
    return loadGuilds();
}

export function saveGuildConfig(guildId, channelId) {
    const guilds = loadGuilds();
    guilds[guildId] = {
        channelId: channelId,
        enabled: true
    };
    saveGuilds(guilds);
    console.log(`Saved config for guild ${guildId}: channel ${channelId}`);
}

export function getGuildConfig(guildId) {
    const guilds = loadGuilds();
    return guilds[guildId];
}
