# Fingerprint Survey Fraud Prevention Tutorial

This use case tutorial shows how to collect survey responses and prevent repeat or fraudulent submissions using Fingerprint.

See the full guide at [Survey Fraud Use Case Tutorial](https://docs.fingerprint.com/docs/survey-fraud-use-case-tutorial).

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

## Resetting the demo database

To clear all survey submissions and reset the demo database:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
