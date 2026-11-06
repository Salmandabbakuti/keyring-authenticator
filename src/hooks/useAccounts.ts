import { useContext } from "react";
import { AccountsContext } from "@/components/AccountsProvider";

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountsProvider.");
  }
  return context;
}
