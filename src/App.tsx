import { useState } from "react";
import {
  ActionIcon,
  Button,
  Container,
  Popover,
  EmptyState
} from "@mantine/core";
import {
  Keyboard,
  KeyRound,
  Plus,
  ScanLine,
  XIcon,
  TextSearch
} from "lucide-react";
import AccountCard from "@/components/AccountCard";
import AccountDialog from "@/components/AccountDialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useClock } from "@/hooks/useClock";

interface AppProps {
  searchQuery: string;
}

const WINDOW_MS = 30_000; // 30 seconds default

export default function App({ searchQuery }: AppProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"manual" | "scan" | null>(null);

  const { accounts } = useAccounts();
  const now = useClock();

  const msRemaining = WINDOW_MS - (now % WINDOW_MS);
  const counter = Math.floor(now / WINDOW_MS);
  const secondsRemaining = Math.ceil(msRemaining / 1000);

  const filtered = accounts.filter((account) =>
    `${account.issuer} ${account.label}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

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
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <EmptyState
              icon={searchQuery ? <TextSearch /> : <KeyRound />}
              title={searchQuery ? "No matching accounts" : "No accounts yet"}
              description={
                searchQuery
                  ? "We couldn't find anything matching your search. Try another search."
                  : "Scan a QR code or enter setup key to get started."
              }
            />
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
              setDialog("scan");
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
              setDialog("manual");
            }}
          >
            Enter a setup key
          </Button>
        </Popover.Dropdown>
      </Popover>

      <AccountDialog
        opened={dialog !== null}
        account={null}
        initialTab={dialog ?? "manual"}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
