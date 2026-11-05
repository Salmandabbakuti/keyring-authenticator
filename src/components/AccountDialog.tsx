import { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Stack,
  Tabs,
  Text,
  TextInput
} from "@mantine/core";
import { Keyboard, ScanLine } from "lucide-react";
import type { Account, AccountDraft } from "@/types";
import { normalizeSecret, parseTotpUri, isValidSecret } from "@/lib/totp";
import { useQrScanner } from "@/hooks/useQrScanner";
import { notifications } from "@mantine/notifications";

type Props = {
  opened: boolean;
  account: Account | null;
  accounts: Account[];
  addAccount: (draft: AccountDraft) => Account;
  updateAccount: (account: Account) => void;
  onClose: () => void;
  initialTab?: "manual" | "scan";
};

export default function AccountDialog({
  opened,
  account,
  accounts,
  addAccount,
  updateAccount,
  onClose,
  initialTab = "manual"
}: Props) {
  const [error, setError] = useState("");

  const handleScannedQrData = (data: string) => {
    try {
      const draft = parseTotpUri(data);
      if (accounts.some((item) => item.secret === draft.secret)) {
        notifications.show({
          message: "This account is already in your authenticator.",
          color: "yellow"
        });
        onClose();
        return true;
      }
      addAccount(draft);
      notifications.show({ message: `${draft.issuer} added`, color: "teal" });
      onClose();
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to read QR code."
      );
      return false;
    }
  };

  const scanner = useQrScanner(
    opened && !account && initialTab === "scan",
    handleScannedQrData
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries()) as AccountDraft;

    const draft = {
      issuer: values.issuer.trim(),
      label: values.label.trim(),
      secret: normalizeSecret(values.secret)
    };
    if (!draft.issuer || !draft.label || !isValidSecret(draft.secret)) {
      setError("Enter an issuer, label, and valid Base32 secret.");
      return;
    }
    if (account) {
      updateAccount({ ...draft, id: account.id });
      notifications.show({ message: "Account updated", color: "teal" });
    } else {
      addAccount(draft);
      notifications.show({ message: "Account added", color: "teal" });
    }
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={account ? "Edit account" : "Add an account"}
      centered
      radius="lg"
    >
      <Tabs defaultValue={initialTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="manual" leftSection={<Keyboard size={15} />}>
            Enter manually
          </Tabs.Tab>
          {!account && (
            <Tabs.Tab value="scan" leftSection={<ScanLine size={15} />}>
              Scan QR
            </Tabs.Tab>
          )}
        </Tabs.List>
        <Tabs.Panel value="manual">
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <TextInput
                name="issuer"
                label="Issuer"
                placeholder="Google"
                defaultValue={account?.issuer}
                required
              />
              <TextInput
                name="label"
                label="Label"
                placeholder="you@example.com"
                defaultValue={account?.label}
                required
              />
              <TextInput
                name="secret"
                label="Secret key"
                placeholder="BASE32 SECRET"
                defaultValue={account?.secret}
                autoComplete="off"
                required
              />
              {error && <Alert color="red">{error}</Alert>}
              <Button fullWidth type="submit">
                {account ? "Save changes" : "Add account"}
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>
        {!account && (
          <Tabs.Panel value="scan">
            <Stack gap="sm">
              <div className="scanner">
                <video ref={scanner.videoRef} muted playsInline />
                {!scanner.starting && (
                  <div className="scan-placeholder">
                    <ScanLine size={28} />
                    <span>Point your camera at a TOTP QR code</span>
                  </div>
                )}
              </div>
              {(error || scanner.error) && (
                <Alert color="red">{error || scanner.error}</Alert>
              )}
              <Text size="xs" c="dimmed">
                A valid QR code adds the account immediately. The secret stays
                in this browser.
              </Text>
            </Stack>
          </Tabs.Panel>
        )}
      </Tabs>
    </Modal>
  );
}
