# Keyring — project guide

## Purpose

A small, browser-only TOTP authenticator. Secrets remain on the device; there is no backend, account system, API, sync, or analytics.
This is a proof of concept for demonstration only and is not recommended for production use.

## Stack

- React 19 + TypeScript
- Bun runtime, development server, and bundler
- Mantine for focused UI primitives; Lucide React icons
- `otplib` for TOTP generation and secret validation
- `qr-scanner` for camera QR scanning
- `localStorage` for persistence

## TOTP contract

- Defaults: SHA1, 6 digits, 30-second period.
- Provisioning URIs with other algorithm/digits/period settings are rejected explicitly.
- Do not silently generate a code using defaults when the QR specifies different settings.
- Normalize Base32 secrets by removing spaces, hyphens, and trailing padding.
- Pass the shared clock's counter to code generation as an explicit `epoch` in seconds; codes and countdowns must derive from the same clock snapshot.

## UX

- Compact Authenticator header, searchable account list, floating + action.
- The + menu offers QR scanning or manual setup.
- A valid scanned TOTP QR adds the account immediately; no confirmation form.
- Manual setup and editing use the account dialog.
- Duplicate scanned secrets are rejected with a notification.
- Deletion requires confirmation.

## Data

`Account = { id, issuer, label, secret }`.
Storage key: `keyring.accounts.v1`.
Secrets are stored in plaintext in localStorage. This demonstration does not provide secure secret storage against XSS or other same-origin script access and is not suitable for production use.

## Structure

- `src/lib/totp.ts`: secret normalization, validation, code generation, provisioning URI parsing.
- `src/lib/storage.ts`: localStorage read/write and stored-data validation.
- `src/components/AccountsProvider.tsx`: account state, CRUD, and persistence provider.
- `src/hooks/useAccounts.ts`: access to account state and CRUD from components.
- `src/hooks/useClock.ts`: shared one-second clock tick.
- `src/hooks/useQrScanner.ts`: camera lifecycle and cancellation.
- `src/components/AccountCard.tsx`: account display and copy action.
- `src/components/AccountDialog.tsx`: manual add/edit and QR scanner UI.
- `src/components/SiteLayout.tsx`: shared header, content, and footer layout.
- `src/App.tsx`: composition and app-level flows.

## Conventions

- Keep components and hooks small; avoid generic abstractions and unnecessary state libraries.
- Keep account data separate from transient UI state.
- Derive countdown and codes from the clock; regenerate codes only when the 30-second counter changes.
- Clean up intervals and camera streams.
- Do not log or transmit secrets.
- Camera access requires HTTPS except on localhost.

## Commands

- `bun install`
- `bun run dev`
- `bun run build`
- `bun run start`

The Bun development server serves `src/index.html` with hot reloading. Camera access requires HTTPS in production; localhost is allowed for development.
