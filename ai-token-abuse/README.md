# Fingerprint AI Token Abuse Prevention Tutorial

This use case tutorial shows how to prevent AI token abuse, such as people creating multiple accounts to claim free AI credits again and again, using Fingerprint. The demo app is a mock AI writing assistant that grants free credits on signup.

See the full guide at [AI Token Abuse Use Case Tutorial](https://docs.fingerprint.com/docs/ai-token-abuse-use-case-tutorial).

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

4. Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Running the bot test

This repo includes a simple Puppeteer script to simulate a headless bot creating 10 new accounts to farm free credits. To run it, use the following command while the server is running:

```bash
node test-bot.js
```

After you complete the tutorial steps, these signups will be rejected by the Bot Detection Smart Signal.

## Resetting the demo database

To clear all accounts and reset the demo database:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
