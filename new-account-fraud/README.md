# Fingerprint New Account Fraud Prevention Tutorial

This use case tutorial shows how to prevent new account fraud, including free trial abuse, multi-accounting, and brute force attacks, using Fingerprint.

See the full guide at [New Account Fraud Use Case Tutorial](https://docs.fingerprint.com/docs/new-account-fraud-use-case-tutorial).

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

### Resetting the demo database

To clear all accounts and reset the demo database:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
