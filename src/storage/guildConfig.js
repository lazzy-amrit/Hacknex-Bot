import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'src/storage/guildConfig.json');

function loadGuildConfig() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            // Check for legacy guildChannels.json
            const legacyFile = path.join(process.cwd(), 'src/storage/guildChannels.json');
            if (fs.existsSync(legacyFile)) {
                console.log("Migrating legacy guildChannels.json to guildConfig.json");
                const oldData = JSON.parse(fs.readFileSync(legacyFile, 'utf-8'));
                // Old format: { "guildId": "channelId" }
                // New format: { "guildId": "channelId" } (Same simple mapping for now)
                fs.writeFileSync(STORAGE_FILE, JSON.stringify(oldData, null, 2));
                return oldData;
            }

            fs.writeFileSync(STORAGE_FILE, '{}');
            return {};
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading guild config:", error);
        return {};
    }
}

function saveGuildConfigInternal(data) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving guild config:", error);
    }
}

export function setGuildChannel(guildId, channelId) {
    const config = loadGuildConfig();
    config[guildId] = channelId;
    saveGuildConfigInternal(config);
    console.log(`Saved channel ${channelId} for guild ${guildId}`);
}

export function getGuildChannel(guildId) {
    const config = loadGuildConfig();
    return config[guildId];
}

export function getAllGuildChannels() {
    return loadGuildConfig();
}
