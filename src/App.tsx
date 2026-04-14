import { AppShell, Group, Text } from '@mantine/core';
import { IconBrandGithub, IconBug } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { UserMenu } from './components/UserMenu';
import './App.css';

declare const __APP_VERSION__: string;

export default function App() {
  return (
    <AppShell
      header={{ height: 50 }}
      footer={{ height: 22 }}
      padding={0}
    >
      <AppShell.Header
        style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md">
            <Text fw={700} size="lg" c="white" component="a" href="/" style={{ textDecoration: 'none' }}>Online SVG code editor</Text>
          </Group>
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer
        style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderTop: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group h="100%" px="xs" justify="space-between">
          <Group gap="xs">
            <Text size="xs" c="dimmed">v{__APP_VERSION__}</Text>
            <Text size="xs" c="dimmed">
              <Text component="a" href="https://unmanagedvisio.com" target="_blank" size="xs" c="dimmed" td="underline">
                UnmanagedVisio
              </Text>
            </Text>
            <Text component="a" href="/privacy-policy.md" target="_blank" size="xs" c="dimmed" td="underline">
              Privacy Policy
            </Text>
          </Group>
          <Group gap="xs">
            <Text
              component="a"
              href="https://github.com/nbelyh/editsvgcode/issues"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              <IconBug size={12} />
            </Text>
            <Text
              component="a"
              href="https://github.com/nbelyh/editsvgcode"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              <IconBrandGithub size={12} />
            </Text>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
