# Fingerprint Account Sharing Prevention Tutorial

This use case tutorial shows how to prevent account sharing using Fingerprint.

See the full guide at [Account Sharing Use Case Tutorial](https://docs.fingerprint.com/docs/account-sharing-use-case-tutorial).

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

This repo includes a simple Puppeteer script to simulate a headless bot login attempt. To run it, use the following command while the server is running:

```bash
node test-bot.js
```

The request will be rejected by the Bot Detection Smart Signal.

## Test account

A default account is included for testing:

- Email: `demo@example.com`
- Password: `password123`

## Resetting the demo database

To clear stored device associations:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
