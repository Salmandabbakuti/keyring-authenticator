import { useEffect, useState } from "react";
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
import type { Account, AccountDraft } from "../types";
import { normalizeSecret, parseTotpUri, isValidSecret } from "../lib/totp";
import { useQrScanner } from "../hooks/useQrScanner";

type Props = {
  opened: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (draft: AccountDraft, id?: string) => void;
  onScanned: (draft: AccountDraft) => void;
  initialTab?: "manual" | "scan";
};

export function AccountDialog({
  opened,
  account,
  onClose,
  onSave,
  onScanned,
  initialTab = "manual"
}: Props) {
  const initialValues: AccountDraft = {
    issuer: "",
    label: "",
    secret: ""
  };
  const [tab, setTab] = useState("manual");
  const [error, setError] = useState("");
  const [values, setValues] = useState<AccountDraft>(initialValues);

  useEffect(() => {
    if (!opened) return;
    setTab(account ? "manual" : initialTab);
    setError("");
    setValues(() => {
      if (!account) return initialValues;
      return {
        issuer: account.issuer,
        label: account.label,
        secret: account.secret
      };
    });
  }, [opened, account]);

  const handleScan = (value: string) => {
    try {
      onScanned(parseTotpUri(value));
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to read QR code."
      );
      return false;
    }
  };

  const scanner = useQrScanner(
    opened && !account && tab === "scan",
    handleScan
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      ...values,
      issuer: values.issuer.trim(),
      label: values.label.trim(),
      secret: normalizeSecret(values.secret)
    };
    if (!draft.issuer || !draft.label || !isValidSecret(draft.secret)) {
      setError("Enter an issuer, label, and valid Base32 secret.");
      return;
    }
    onSave(draft, account?.id);
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={account ? "Edit account" : "Add an account"}
      centered
      radius="lg"
    >
      <Tabs
        value={tab}
        onChange={(value) => {
          setTab(value || "manual");
          setError("");
        }}
      >
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
          <form onSubmit={submit}>
            <Stack gap="sm">
              <TextInput
                label="Issuer"
                placeholder="Google"
                value={values.issuer}
                onChange={(event) => {
                  const issuer = event.target.value;
                  setValues((v) => ({
                    ...v,
                    issuer
                  }));
                }}
                required
              />
              <TextInput
                label="Label"
                placeholder="you@example.com"
                value={values.label}
                onChange={(event) => {
                  const label = event.target.value;
                  setValues((v) => ({
                    ...v,
                    label
                  }));
                }}
                required
              />
              <TextInput
                label="Secret key"
                placeholder="BASE32 SECRET"
                value={values.secret}
                onChange={(event) => {
                  const secret = event.target.value;
                  setValues((v) => ({
                    ...v,
                    secret
                  }));
                }}
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
