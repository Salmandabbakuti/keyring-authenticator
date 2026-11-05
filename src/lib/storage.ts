import type { Account } from "@/types";
import { isValidSecret, normalizeSecret } from "@/lib/totp";

const STORAGE_KEY = "keyring.accounts.v1";

function isAccount(value: Account): boolean {
  if (!value || typeof value !== "object") return false;

  return (
    typeof value.id === "string" &&
    typeof value.issuer === "string" &&
    typeof value.label === "string" &&
    typeof value.secret === "string" &&
    isValidSecret(value.secret)
  );
}

export function loadAccounts(): Account[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (!Array.isArray(stored)) return [];
    return stored.filter(isAccount).map((item) => ({
      ...item,
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
