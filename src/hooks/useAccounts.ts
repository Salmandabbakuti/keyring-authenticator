import { useEffect, useState } from "react";
import type { Account, AccountDraft } from "@/types";
import { loadAccounts, persistAccounts } from "@/lib/storage";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);

  useEffect(() => {
    if (!persistAccounts(accounts)) {
      // Storage can be unavailable or full; the current session remains usable.
      console.error(
        "Unable to persist authenticator accounts to localStorage."
      );
    }
  }, [accounts]);

  function addAccount(draft: AccountDraft) {
    const account = { ...draft, id: crypto.randomUUID() };
    setAccounts((current) => [...current, account]);
    return account;
  }

  function updateAccount(account: Account) {
    setAccounts((current) =>
      current.map((item) => (item.id === account.id ? account : item))
    );
  }

  function deleteAccount(id: string) {
    setAccounts((current) => current.filter((account) => account.id !== id));
  }

  return { accounts, addAccount, updateAccount, deleteAccount };
}
