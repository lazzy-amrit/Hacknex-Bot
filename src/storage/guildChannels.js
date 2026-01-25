import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'src/storage/guildChannels.json');

function loadGuildChannels() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            fs.writeFileSync(STORAGE_FILE, '{}');
            return {};
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading guild channels:", error);
        return {};
    }
}

function saveFile(data) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving guild channels:", error);
    }
}

export function saveGuildChannel(guildId, channelId) {
    const channels = loadGuildChannels();
    channels[guildId] = channelId;
    saveFile(channels);
    console.log(`Saved channel ${channelId} for guild ${guildId}`);
}

export function getAllGuildChannels() {
    return loadGuildChannels();
}

export function getGuildChannel(guildId) {
    const channels = loadGuildChannels();
    return channels[guildId];
}

// Aliases for user requested names
export const getAllGuilds = getAllGuildChannels;
export const setGuildChannel = saveGuildChannel;
