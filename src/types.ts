export type Account = {
  id: string;
  issuer: string;
  label: string;
  secret: string;
};

export type AccountDraft = Omit<Account, "id">;

export type AccountDialog =
  | { type: "add"; mode?: "manual" | "scan" }
  | { type: "edit"; account: Account };
