# 🏆 Hacknex Bot

**The automated hackathon tracker for your Discord community.**

Hacknex solves the problem of missing out on great hackathons by automatically scanning major platforms (Devfolio, Unstop, MLH) and delivering organized alerts directly to your server. It’s built for students, developers, and tech communities who want to stay ahead without the manual work.

---

## 🚀 Add Hacknex to Your Server

[**Click here to invite Hacknex**](https://discord.com/oauth2/authorize?client_id=1464258235669414145&permissions=2147568640&integration_type=0&scope=bot+applications.commands)

---

## ✨ Features

- **No More FOMO**: Effectively tracks multiple hackathon platforms so you don't have to check them manually.
- **Zero Spam**: Our smart deduplication ensures you only get notified once per event. No repeated alerts.
- **Clean Format**: Alerts arrive as beautiful cards with all the info you need—title, platform, and registration link.
- **Set & Forget**: Once configured, Hacknex runs quietly in the background, reliably delivering updates every hour.
- **Privacy First**: We don’t track your members or read your chat. The bot strictly does one job: posting hackathons.

---

## ⚡ Quick Setup

Getting started takes less than a minute.

1.  **Invite the bot** to your server using the link above.
2.  **Run the setup command** in the text channel where you want alerts to appear:
    ```
    /setup channel:#alerts
    ```
3.  **Done!** Hacknex will now automatically post new hackathons to that channel.

*Note: You need `Administrator` permissions on your server to run the setup command.*

---

## 🛠 Commands

| Command | Who | Description |
| :--- | :--- | :--- |
| `/setup` | **Admins** | Configures which channel the bot uses to post alerts. |
| `/latest` | **Everyone** | Instantly shows the 5 most recent hackathons found. Good for checking what's active right now. |

---

## 🧠 How It Works

Hacknex is designed to be efficient and reliable:
1.  **Scan**: Every hour, it checks Devfolio, Unstop, and MLH for events.
2.  **Normalize**: It standardizes the messy data into a clean, consistent format.
3.  **Deduplicate**: It checks if an event has already been posted to avoid duplicates.
4.  **Deliver**: New events are sent instantly to your configured channel.

---

## 📦 Tech Stack

Built with simplicity and performance in mind:

-   **Runtime**: Node.js
-   **Framework**: discord.js
-   **Scraping**: Axios & Cheerio
-   **Scheduling**: node-cron
-   **Storage**: Local JSON (Lightweight & fast)

---

## � Privacy & Safety

We take privacy seriously.

-   **No Message Reading**: Hacknex does not (and cannot) read your private messages or server chat history.
-   **No Personal Data**: We do not collect user data. We only store the Server ID and Channel ID needed to send messages.
-   **Open Source**: This project is fully open-source, so you can inspect the code yourself to verify how it works.

---

## 🔧 Self-Hosting

If you prefer to host your own instance:

1.  Clone this repository.
2.  Run `npm install` to install dependencies.
3.  Create a `.env` file with your `DISCORD_TOKEN`.
4.  Run `npm start` to bring it online.

---

## 🤝 Roadmap

- [x] Support for Devfolio, Unstop, and MLH
- [x] Smart deduplication logic
- [x] Multi-server support
- [ ] Filter alerts by Online/Offline mode
- [ ] Customizable role pings (e.g., @Hackers)

---

## 📜 Disclaimer

Hacknex aggregates publicly available data from hackathon platforms for educational and community purposes. We respect platform rate limits and do not claim ownership of the event data.
