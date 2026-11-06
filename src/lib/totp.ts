import { createGuardrails, generateSync } from "otplib";
import type { AccountDraft } from "@/types";

const guardrails = createGuardrails({ MIN_SECRET_BYTES: 10 });

export function normalizeSecret(value: string) {
  return value
    .replace(/[\\s-]/g, "")
    .replace(/=+$/, "")
    .toUpperCase();
}

export function isValidSecret(value: string) {
  try {
    generateSync({ secret: normalizeSecret(value), guardrails });
    return true;
  } catch {
    return false;
  }
}

export function generateCode(secret: string, counter: number) {
  return generateSync({ secret, guardrails, epoch: counter * 30 });
}

export function parseTotpUri(value: string): AccountDraft {
  let uri: URL;
  try {
    uri = new URL(value);
  } catch {
    throw new Error("The QR code does not contain a valid provisioning URI.");
  }

  if (uri.protocol !== "otpauth:" || uri.hostname !== "totp") {
    throw new Error("This is not a TOTP QR code.");
  }

  const algorithm = (uri.searchParams.get("algorithm") || "SHA1").toUpperCase();
  const digits = Number(uri.searchParams.get("digits") || 6);
  const period = Number(uri.searchParams.get("period") || 30);

  if (algorithm !== "SHA1" || digits !== 6 || period !== 30) {
    throw new Error(
      "This account uses unsupported TOTP settings. Only SHA1, 6 digits, and 30 seconds are supported."
    );
  }

  const secret = normalizeSecret(uri.searchParams.get("secret") || "");
  if (!isValidSecret(secret))
    throw new Error("The QR code contains an invalid secret.");

  let uriLabel: string;
  try {
    uriLabel = decodeURIComponent(uri.pathname.slice(1));
  } catch {
    throw new Error("The QR code contains an invalid account label.");
  }

  const separator = uriLabel.indexOf(":");
  const labelIssuer = separator < 0 ? "" : uriLabel.slice(0, separator).trim();
  const label = (
    separator < 0 ? uriLabel : uriLabel.slice(separator + 1)
  ).trim();
  const issuer = (
    uri.searchParams.get("issuer") ||
    labelIssuer ||
    "Authenticator"
  ).trim();

  if (!label || !issuer)
    throw new Error("The QR code is missing an issuer or account label.");

  return { issuer, label, secret };
}
