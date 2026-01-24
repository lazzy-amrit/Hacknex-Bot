# Hacknex Bot

A Discord bot built with Node.js and discord.js, designed to fetch and display hackathon information.
    
## Current Status
- Bot foundation complete
- Hourly cron scheduler added
- Discord message automation working

## Features

- **Startup Notification**: Sends a "Live" message to a configured channel on startup.
- **Scheduler**: Hourly cron job that sends a status message to Discord (`node-cron`).
- **Extensible Architecture**: Structured with a `src` folder and ready for future modules (data fetchers, commands).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/amanbotx2-fr/Hacknex-Bot.git
    cd Hacknex-Bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    DISCORD_TOKEN=your_bot_token_here
    DISCORD_CHANNEL_ID=your_channel_id_here
    ```

## Usage

Start the bot:

```bash
npm start
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
