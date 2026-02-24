# Fingerprint use case tutorials

This repository contains tutorials showing how to use [Fingerprint](https://fingerprint.com/) to solve common fraud prevention and account security problems.

Each tutorial is a self-contained demo application with:

- A **starter branch** with the initial project setup
- A **final branch** with the completed Fingerprint implementation

Current tutorials:

- [**Account sharing prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/account-sharing) – Prevent account sharing across multiple devices.
- [**Ban evasion prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/ban-evasion) – Prevent banned users from evading enforcement and returning under new accounts.
- [**Card testing prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/card-testing) – Stop card testing and card cracking attacks using device intelligence.
- [**Chargeback dispute support**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/chargeback-dispute) – Link purchases to devices to help investigate and dispute chargebacks.
- [**Coupon abuse prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/coupon-abuse) – Enforce appropriate coupon usage per visitor.
- [**Credential stuffing prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/credential-stuffing) – Prevent credential stuffing attacks and protect against account takeover.
- [**Loan application fraud prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/loan-risk) – Collect high-quality, low-risk loan applications and prevent loan application fraud.
- [**New account fraud prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/new-account-fraud) – Stop multi-accounting, free trial abuse, and other new account fraud.
- [**Paywall enforcement**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/paywall) – Enforce paywalls even when users clear cookies or change IP addresses.
- [**Regional pricing enforcement**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/regional-pricing) – Enforce region-based pricing and stop VPN-based pricing abuse.
- [**SMS pumping prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/sms-pumping) – Prevent automated SMS pumping abuse and reduce messaging costs.
- [**Survey fraud prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/survey-fraud) – Stop duplicate and fraudulent survey submissions.
- [**Web scraping prevention**](https://github.com/fingerprintjs/use-case-tutorials/tree/starter/web-scraping) – Protect your proprietary content from being scraped by bots.

## General setup

1. Clone this repo and **within the use case folder of interest**, run:

```bash
npm install
```

2. Copy or rename `.env.example` to `.env` and add your Fingerprint API keys.

3. Start the server:

```bash
npm run dev
```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser to view the demo application.

## Resetting the demo databases

To reset the demo database for a given use case:

- Click **Reset demo DB** at the bottom of the demo app page, or
- Run this from the terminal:

```bash
npm run reset-db
```
