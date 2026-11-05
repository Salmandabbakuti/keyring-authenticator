# Keyring

A browser-only TOTP authenticator proof of concept, built with React, TypeScript, and Vite. Account secrets are stored locally in the browser; there is no backend or sync.

> **Demonstration only:** This project is not recommended for production use. Secrets are stored in plaintext in `localStorage` and are accessible to same-origin scripts, including malicious scripts injected through an XSS vulnerability.

## Run locally

```sh
bun install
bun run dev
```
