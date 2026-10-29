# Fingerprint Bonus Abuse Prevention Tutorial

This use case tutorial shows how to prevent bonus abuse, such as players creating multiple accounts to claim the same welcome offer, using Fingerprint. The demo app is a mock prediction market that grants a welcome bonus on signup.

See the full guide at [Bonus Abuse Use Case Tutorial](https://docs.fingerprint.com/docs/bonus-abuse-use-case-tutorial).

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

This repo includes a simple Puppeteer script to simulate a headless bot creating 10 new accounts to farm the welcome bonus. To run it, use the following command while the server is running:

```bash
node test-bot.js
```

These signups will be rejected by the Bot Detection Smart Signal.

## Resetting the demo database

To clear all accounts and reset the demo database:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
