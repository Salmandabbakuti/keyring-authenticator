import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Account, AccountDraft } from "@/types";
import { loadAccounts, persistAccounts } from "@/lib/storage";

type AccountsContextValue = {
  accounts: Account[];
  addAccount: (draft: AccountDraft) => Account;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
};

export const AccountsContext = createContext<AccountsContextValue | null>(null);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);

  useEffect(() => {
    const isPersisted = persistAccounts(accounts);
    if (!isPersisted)
      console.error(
        "Unable to persist authenticator accounts to localStorage."
      );
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

  return (
    <AccountsContext
      value={{ accounts, addAccount, updateAccount, deleteAccount }}
    >
      {children}
    </AccountsContext>
  );
}
