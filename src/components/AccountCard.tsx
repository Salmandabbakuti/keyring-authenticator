import {
  ActionIcon,
  Button,
  Menu,
  Modal,
  Paper,
  Progress,
  Text,
  CopyButton
} from "@mantine/core";
import { useMemo, useState } from "react";
import { Check, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { generateCode } from "@/lib/totp";
import type { Account } from "@/types";
import AccountDialog from "@/components/AccountDialog";
import { useAccounts } from "@/hooks/useAccounts";

type Props = {
  account: Account;
  counter: number;
  secondsRemaining: number;
};

export default function AccountCard({
  account,
  counter,
  secondsRemaining
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { deleteAccount } = useAccounts();

  const code = useMemo(
    () => generateCode(account.secret, counter),
    [account.secret, counter]
  );

  return (
    <Paper className="card" radius="lg" p="lg" withBorder>
      <div className="card-top">
        <div className="identity">
          <div className="issuer-mark">
            {account.issuer.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <Text fw={600}>{account.issuer}</Text>
            <Text size="xs" c="dimmed">
              {account.label}
            </Text>
          </div>
        </div>
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Account actions"
            >
              <MoreHorizontal size={19} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Pencil size={15} />}
              onClick={() => setEditing(true)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<Trash2 size={15} />}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      <div className="code-row">
        <div className="code">
          {code.slice(0, 3)} {code.slice(3)}
        </div>
        <CopyButton value={code}>
          {({ copied, copy }) => (
            <ActionIcon
              size="lg"
              variant="light"
              color={copied ? "teal" : "gray"}
              aria-label="Copy code"
              onClick={copy}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </ActionIcon>
          )}
        </CopyButton>
      </div>
      <div className="timer">
        <Progress
          value={(secondsRemaining / 30) * 100}
          size={5}
          radius="xl"
          color={secondsRemaining <= 5 ? "orange" : "teal"}
        />
        <Text size="xs" c="dimmed">
          {secondsRemaining}s
        </Text>
      </div>
      <AccountDialog
        opened={editing}
        account={account}
        onClose={() => setEditing(false)}
      />
      <Modal
        opened={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Delete account?"
        centered
        size="sm"
        radius="lg"
      >
        <Text size="sm" c="dimmed">
          This removes {account.issuer} – {account.label} and its secret from
          this browser.
        </Text>
        <div className="delete-actions">
          <Button variant="default" onClick={() => setConfirmingDelete(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<Trash2 size={15} />}
            onClick={() => {
              deleteAccount(account.id);
              setConfirmingDelete(false);
              notifications.show({ message: "Account deleted", color: "teal" });
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </Paper>
  );
}
