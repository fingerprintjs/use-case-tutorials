# Fingerprint Web Scraping Prevention Tutorial

This use case tutorial shows how to protect proprietary data from being scraped by bots using Fingerprint.

See the full guide at [Web Scraping Use Case Tutorial](https://docs.fingerprint.com/docs/web-scraping-use-case-tutorial).

## Setup

1. Clone this repo and install dependencies:

```bash
npm install
```

2. Copy or rename `.env.example` to `.env` and add your Fingerprint API keys.

3. Start the server:

```bash
npm run dev
```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser to view the demo application.

### Running the bot test

This repo includes a simple Puppeteer script to simulate a headless bot trying to scrape the proprietary data. To run it, use the following command while the server is running:

```bash
node test-bot.js
```

The request will be flagged and rejected by the Bot Detection Smart Signal.
