# Keyring

A browser-only TOTP authenticator proof of concept, built with React, TypeScript, and Bun. Account secrets are stored locally in the browser; there is no backend, account system, sync, or analytics.

> **Demonstration only:** This project is not recommended for production use. Secrets are stored in plaintext in `localStorage` and are accessible to same-origin scripts, including malicious scripts injected through an XSS vulnerability.

## Requirements

Install [Bun](https://bun.sh/) to install dependencies and run the app.

## Development

```bash
bun install
bun run dev
```

The Bun development server starts at `http://localhost:3000` with hot reloading.

## Production

```bash
bun run build
bun run start
```

The build outputs browser assets to `dist/`. `bun run start` launches the Bun server from `src/index.ts`, which serves the app's HTML entry point. Camera access on deployed sites requires HTTPS (localhost is allowed for development).

## TOTP behavior

Codes use SHA1, six digits, and a 30-second period. The code and countdown share the same clock snapshot: code generation receives the current 30-second counter as an explicit epoch in seconds, rather than independently reading the wall clock. Provisioning QR codes that specify unsupported TOTP settings are rejected.
