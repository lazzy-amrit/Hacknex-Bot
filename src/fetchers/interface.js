/**
 * Normalized Hackathon Object
 * @typedef {Object} Hackathon
 * @property {string} id - Unique identifier or URL for deduplication
 * @property {string} title - Name of the hackathon
 * @property {string} url - Link to the hackathon page
 * @property {Date} startDate - Start date of the event
 * @property {Date} endDate - End date of the event
 * @property {string} location - "Online" or "City, Country"
 * @property {string[]} [tags] - Optional list of tags (e.g. ["AI", "Beginner"])
 */

/**
 * Fetcher Function Interface
 * 
 * Every fetcher module should export a function like this.
 * It should return an array of normalized Hackathon objects.
 * 
 * @returns {Promise<Hackathon[]>}
 */
export async function fetchHackathons() {
    // Example implementation
    return [
        {
            id: "https://example.com/hackathon-1",
            title: "Example Hackathon",
            url: "https://example.com/hackathon-1",
            startDate: new Date("2023-12-01"),
            endDate: new Date("2023-12-03"),
            location: "Online",
            tags: ["Open Source", "JavaScript"]
        }
    ];
}
