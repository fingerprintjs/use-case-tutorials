# Fingerprint Chargeback Dispute Tutorial

This use case tutorial shows how to use Fingerprint to dispute chargebacks by linking purchase history to a browser/device.

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

## Resetting the demo database

To clear all purchases and reset the demo database:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
