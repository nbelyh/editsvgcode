import { AppShell, Group, Text, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconBrandGithub, IconBug, IconSun, IconMoon } from '@tabler/icons-react';
import { Outlet, Link } from 'react-router-dom';
import { UserMenu } from './components/UserMenu';
import { FooterLink } from './components/FooterLink';
import './App.css';

declare const __APP_VERSION__: string;

export default function App() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppShell
      header={{ height: 50 }}
      footer={{ height: 26 }}
      padding={0}
    >
      <AppShell.Header className="app-chrome">
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <img src="/editsvgcode-logo.svg" alt="Logo" height={28} />
            <Text fw={700} size="lg" component="a" href="/" className="app-header-title">Online SVG code editor</Text>
            <Text size="sm" c="dimmed" component={Link} to="/pricing" style={{ textDecoration: 'none' }}>Go Pro</Text>
          </Group>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleColorScheme} aria-label="Toggle color scheme">
              {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer className="app-chrome">
        <Group h="100%" px="xs" justify="space-between">
          <Group gap="xs">
            <Text size="sm" c="dimmed">v{__APP_VERSION__}</Text>
            <FooterLink href="https://unmanagedvisio.com" target="_blank">© UnmanagedVisio</FooterLink>
            <FooterLink href="/privacy-policy.md" target="_blank">Privacy Policy</FooterLink>
          </Group>
          <Group gap="xs">
            <FooterLink href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer" icon={<IconBug size={14} />}>
              {' '}Report an issue
            </FooterLink>
            <FooterLink href="https://github.com/nbelyh/editsvgcode" target="_blank" rel="noopener noreferrer" icon={<IconBrandGithub size={14} />}>
              {' '}GitHub
            </FooterLink>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
