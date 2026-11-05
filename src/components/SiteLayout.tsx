import { useState } from "react";
import {
  ActionIcon,
  Container,
  TextInput,
  useComputedColorScheme,
  useMantineColorScheme
} from "@mantine/core";
import { Moon, Search, ShieldCheck, Sun } from "lucide-react";
import App from "../App";

export default function SiteLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const { setColorScheme } = useMantineColorScheme();

  const computedColorScheme = useComputedColorScheme("light");
  const nextColorScheme = computedColorScheme === "dark" ? "light" : "dark";

  return (
    <>
      <header className="header">
        <Container size="md" className="header-inner">
          <div className="app-brand">
            <span className="brand-icon" aria-hidden="true">
              <ShieldCheck size={14} />
            </span>
            <div className="app-title">Authenticator</div>
          </div>
          <TextInput
            className="header-search"
            placeholder="Search"
            aria-label="Search accounts"
            leftSection={<Search size={17} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <ActionIcon
            className="theme-switcher"
            variant="default"
            size={34}
            radius="xl"
            aria-label={`Switch to ${nextColorScheme} mode`}
            title={`Switch to ${nextColorScheme} mode`}
            onClick={() => setColorScheme(nextColorScheme)}
          >
            {computedColorScheme === "dark" ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </ActionIcon>
        </Container>
      </header>
      <main>
        <App searchQuery={searchQuery} />
      </main>
      <footer className="app-footer">
        Codes refresh every 30 seconds <span>·</span> Demo only — not intended
        for production use
      </footer>
    </>
  );
}
