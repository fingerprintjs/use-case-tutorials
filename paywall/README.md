# Fingerprint Paywall Enforcement Tutorial

This use case tutorial shows how to enforce a paywall on your website using Fingerprint even when cookies are cleared.

See the full guide at [Paywall Enforcement Use Case Tutorial](https://docs.fingerprint.com/docs/paywall-use-case-tutorial).

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

## Running the bot test

This repo includes a simple Puppeteer script to simulate a headless bot reading a paywalled article. To run it, use the following command while the server is running:

```bash
node test-bot.js
```

After you complete the tutorial steps, this request will be rejected by the Bot Detection Smart Signal.

## Resetting the demo

To clear free articles count and reset the demo:

- Click **Reset demo** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
