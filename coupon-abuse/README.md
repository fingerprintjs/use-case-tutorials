# Fingerprint Coupon Abuse Prevention Tutorial

This use case tutorial shows how to prevent coupon abuse using Fingerprint.

## Setup

1. Clone this repo and install dependencies:

```bash
npm install
```

2. Copy or rename `.env.example` to `.env` and add your Fingerprint secret API key.
3. Start the server:

```bash
npm run dev
```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Default coupons

The default coupons are:

- `WELCOME20` - 20% off
- `SAVE10` - 10% off

## Resetting the demo database

To clear all redemptions and reset coupon usage:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
