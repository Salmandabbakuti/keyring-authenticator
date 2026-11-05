import { useState } from "react";
import {
  ActionIcon,
  Button,
  Container,
  Modal,
  Popover,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Keyboard,
  KeyRound,
  Plus,
  ScanLine,
  Trash2,
  XIcon
} from "lucide-react";
import { AccountCard } from "./components/AccountCard";
import { AccountDialog } from "./components/AccountDialog";
import { useSiteSearchQuery } from "./components/SiteLayout";
import { useAccounts } from "./hooks/useAccounts";
import { useClock } from "./hooks/useClock";
import type {
  Account,
  AccountDraft,
  AccountDialog as DialogState
} from "./types";

export default function App() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { query } = useSiteSearchQuery();
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);
  const now = useClock();
  const counter = Math.floor(now / 30_000);
  const secondsRemaining = 30 - (Math.floor(now / 1000) % 30);

  const filtered = accounts.filter((account) =>
    `${account.issuer} ${account.label}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  function saveAccount(draft: AccountDraft, id?: string) {
    if (id) updateAccount({ ...draft, id });
    else addAccount(draft);
    setDialog(null);
    notifications.show({
      message: id ? "Account updated" : "Account added",
      color: "teal"
    });
  }

  function addScannedAccount(draft: AccountDraft) {
    const duplicate = accounts.some(
      (account) => account.secret === draft.secret
    );
    if (duplicate) {
      notifications.show({
        message: "This account is already in your authenticator.",
        color: "yellow"
      });
      setDialog(null);
      return;
    }
    addAccount(draft);
    setDialog(null);
    notifications.show({ message: `${draft.issuer} added`, color: "teal" });
  }

  function removeAccount() {
    if (!pendingDelete) return;
    deleteAccount(pendingDelete.id);
    setPendingDelete(null);
    notifications.show({ message: "Account deleted", color: "teal" });
  }

  return (
    <>
      <Container size="md" className="main">
        {filtered.length ? (
          <div className="grid">
            {filtered.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                counter={counter}
                secondsRemaining={secondsRemaining}
                onEdit={(item) => setDialog({ type: "edit", account: item })}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <KeyRound size={25} />
            </div>
            <Text fw={600}>
              {query ? "No matching accounts" : "No accounts yet"}
            </Text>
            <Text size="sm" c="dimmed">
              {query
                ? "Try another search."
                : "Scan a QR code or enter an account secret to get started."}
            </Text>
          </div>
        )}
      </Container>

      <Popover
        opened={addMenuOpen}
        onChange={setAddMenuOpen}
        position="top-end"
        shadow="md"
        radius="lg"
        width={220}
        floatingStrategy="fixed"
        middlewares={{
          flip: { padding: 16 },
          shift: { padding: 16 }
        }}
      >
        <Popover.Target>
          <ActionIcon
            className="add-fab"
            size={58}
            radius="xl"
            variant="filled"
            color="teal"
            aria-label="Add account"
            onClick={() => setAddMenuOpen((open) => !open)}
          >
            {addMenuOpen ? <XIcon size={28} /> : <Plus size={28} />}
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown p="xs">
          <Button
            fullWidth
            justify="flex-start"
            variant="subtle"
            leftSection={<ScanLine size={17} />}
            onClick={() => {
              setAddMenuOpen(false);
              setDialog({ type: "add", mode: "scan" });
            }}
          >
            Scan a QR code
          </Button>
          <Button
            fullWidth
            justify="flex-start"
            variant="subtle"
            leftSection={<Keyboard size={17} />}
            onClick={() => {
              setAddMenuOpen(false);
              setDialog({ type: "add", mode: "manual" });
            }}
          >
            Enter a setup key
          </Button>
        </Popover.Dropdown>
      </Popover>

      <AccountDialog
        opened={dialog !== null}
        account={dialog?.type === "edit" ? dialog.account : null}
        initialTab={dialog?.type === "add" ? dialog.mode : "manual"}
        onClose={() => setDialog(null)}
        onSave={saveAccount}
        onScanned={addScannedAccount}
      />

      <Modal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete account?"
        centered
        size="sm"
        radius="lg"
      >
        <div className="delete-content">
          <Text size="sm" c="dimmed">
            This removes {pendingDelete?.issuer} – {pendingDelete?.label} and
            its secret from this browser.
          </Text>
          <div className="delete-actions">
            <Button variant="default" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<Trash2 size={15} />}
              onClick={removeAccount}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
