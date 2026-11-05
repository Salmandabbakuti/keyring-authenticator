import type { Account } from "../types";
import { isValidSecret, normalizeSecret } from "./totp";

const STORAGE_KEY = "keyring.accounts.v1";

type StoredAccount = Record<string, string>;

function isAccount(value: unknown): value is StoredAccount {
  if (!value || typeof value !== "object") return false;

  const item = value as StoredAccount;
  const label = item.label ?? item.account;

  return (
    typeof item.id === "string" &&
    typeof item.issuer === "string" &&
    typeof label === "string" &&
    typeof item.secret === "string" &&
    isValidSecret(item.secret)
  );
}

export function loadAccounts(): Account[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (!Array.isArray(stored)) return [];
    return stored.filter(isAccount).map((item) => ({
      id: item.id,
      issuer: item.issuer,
      label: item.label,
      secret: normalizeSecret(item.secret)
    }));
  } catch {
    return [];
  }
}

export function persistAccounts(accounts: Account[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return true;
  } catch {
    return false;
  }
}
