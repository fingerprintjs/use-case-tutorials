# Fingerprint use case tutorials

This repository contains tutorials showing how to use [Fingerprint](https://fingerprint.com/) to solve common fraud prevention and account security problems.

Each tutorial is a self-contained demo application with:

- A **starter branch** with the initial project setup
- A **final branch** with the completed Fingerprint implementation

Current tutorials:

- [**Coupon abuse prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/coupon-abuse) – enforce one-time coupon usage per visitor

More tutorials will be added over time.

## General setup

1. Clone this repo and within the use case folder of interest, run:

```bash
npm install
```

2. Copy or rename `.env.example` to `.env` and add your Fingerprint secret API key.

3. Start the server:

```bash
npm run dev
```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Resetting the demo databases

To reset the demo database for a given use case:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
