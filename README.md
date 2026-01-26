# 🏆 Hacknex Bot

**A Data-Driven Discord Bot for Automated Hackathon Alerts**

Hacknex constantly scans top hackathon platforms (**Devfolio**, **Unstop**, **MLH**) and delivers real-time alerts directly to your Discord server. Designed for communities, colleges, and tech enthusiasts who never want to miss an opportunity.

---

## ✨ Features

- **Multi-Platform Scraping**: Aggregates data from Devfolio, Unstop, and MLH efficiently.
- **Smart Deduplication**: Uses ID-based matching to ensure you never see the same hackathon twice.
- **Auto-Formatting**: Delivers beautiful, clean Discord embeds with images and quick links.
- **Zero Spam**: Only alerts when *new* hackathons are found.
- **Robust Cron System**: Runs hourly scans with built-in network failure protection and rate limiting.
- **Multi-Server Ready**: Fully supports infinite servers with per-guild configuration.

---

## 🚀 Quick Setup

### 1. Invite the Bot
[**Click here to invite Hacknex to your server**](#) *(Add your OAuth URL here)*

### 2. Configure Channel
Once the bot joins, you must tell it where to post alerts. (Requires `Administrator` permission)

```
/setup channel:#your-hackathon-alerts
```

### 3. Done!
The bot will now automatically post new hackathons every hour. You don't need to do anything else.

---

## 🛠 Commands

| Command | Permission | Description |
| :--- | :--- | :--- |
| `/setup` | **Admin** | Configure the channel for alerts. |
| `/latest` | Everyone | Show the 5 most recently fetched hackathons instantly. |

---

## 📦 Tech Stack

- **Runtime**: Node.js (v18+)
- **Library**: discord.js (v14)
- **Scraping**: Axios + Cheerio
- **Task Scheduling**: node-cron
- **Storage**: JSON-based persistent storage (No database required)

---

## 🔧 Installation (Self-Host)

If you want to run your own instance of Hacknex:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/hacknex-bot.git
    cd hacknex-bot
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Copy the example file and add your Discord Token.
    ```bash
    cp .env.example .env
    ```
    Edit `.env`:
    ```
    DISCORD_TOKEN=your_token_here
    ```

4.  **Start the Bot**
    ```bash
    npm start
    ```

---

## 🤝 Roadmap

- [x] Multi-platform scraping
- [x] ID-based deduplication
- [x] Multi-server support
- [ ] Role ping configuration
- [ ] Filtering by hackathon mode (Online/Offline)

---

### Disclaimer
This bot scrapes public data. Use responsibly and respect the rate limits of source platforms.
