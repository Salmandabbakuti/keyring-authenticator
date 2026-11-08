import { useState } from "react";
import { ActionIcon, Button, Container, Popover, Text } from "@mantine/core";
import { Keyboard, KeyRound, Plus, ScanLine, XIcon } from "lucide-react";
import AccountCard from "@/components/AccountCard";
import AccountDialog from "@/components/AccountDialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useClock } from "@/hooks/useClock";

interface AppProps {
  searchQuery: string;
}

export default function App({ searchQuery }: AppProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"manual" | "scan" | null>(null);

  const { accounts } = useAccounts();
  const now = useClock();

  const secondsSinceEpoch = Math.floor(now / 1000);
  const secondsRemaining = 30 - (secondsSinceEpoch % 30);
  const counter = Math.floor(secondsSinceEpoch / 30); // Reuses the totalSeconds work

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
            <div className="empty-icon">
              <KeyRound size={25} />
            </div>
            <Text fw={600}>
              {searchQuery ? "No matching accounts" : "No accounts yet"}
            </Text>
            <Text size="sm" c="dimmed">
              {searchQuery
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
