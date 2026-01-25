# Hacknex Bot

A Discord bot that tracks and posts new hackathon alerts from Devfolio, Unstop, and MLH to your server.

## Features
- **Hourly Tracking**: Automatically scans for new hackathons every hour.
- **Multi-Platform**: Supports Devfolio, Unstop, and MLH.
- **Rich Alerts**: Posts detailed embeds with banners and direct links.
- **Deduplication**: Ensures the same hackathon is never posted twice.
- **Multi-Server**: Works across multiple Discord servers.
- **Slash Commands**:
  - `/latest`: View the most recent hackathons.
  - `/setup`: Configure the alert channel for your server (Admin only).

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hacknex-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Copy the example config:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your `DISCORD_TOKEN`.

4. **Start the Bot**
   ```bash
   npm start
   ```

## Usage

- **Invite the bot** to your server.
- Run **/setup** in the channel where you want hackathon alerts.
- Check **/latest** at any time to see recent opportunities.

**Note**: JSON storage files (`seenHackathons.json` and `guildChannels.json`) are automatically created at runtime in `src/storage/`.
