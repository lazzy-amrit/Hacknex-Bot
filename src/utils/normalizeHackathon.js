import crypto from 'crypto';

/**
 * Normalizes hackathon data into a standard schema.
 * @param {string} platform - The source platform ("Devfolio", "Unstop", "MLH")
 * @param {object} raw - The raw hackathon object
 * @returns {object} Normalized hackathon object
 */
export function normalizeHackathon(platform, raw) {
    const title = raw.title || raw.name || "Untitled Hackathon";
    const url = raw.url || raw.link || "";
    const image = raw.image || raw.banner_url || raw.cover_image || raw.logoUrl2 || null;

    // Generate a stable ID based on the URL (or fallback to title if no URL)
    // Using MD5 for a short, stable hash string
    const idSource = url || title;
    const id = crypto.createHash('md5').update(idSource).digest('hex');

    return {
        id: id,
        title: title,
        url: url,
        platform: platform,
        image: image,
        startsAt: raw.startsAt || null,
        endsAt: raw.endsAt || null,
        location: raw.location || null,
        fetchedAt: Date.now()
    };
}
