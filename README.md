# Keyring

A browser-only TOTP authenticator proof of concept, built with React, TypeScript, and Vite. Account secrets are stored locally in the browser; there is no backend or sync.

> **Demonstration only:** This project is not recommended for production use. Secrets are stored in plaintext in `localStorage` and are accessible to same-origin scripts, including malicious scripts injected through an XSS vulnerability.

## Run locally

```bash
bun install
bun run dev
```

## TOTP behavior

Codes use SHA1, six digits, and a 30-second period. The code and countdown share the same clock snapshot: code generation receives the current 30-second counter as an explicit epoch in seconds, rather than independently reading the wall clock. Provisioning QR codes that specify unsupported TOTP settings are rejected.
