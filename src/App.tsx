import { AppShell, Group, Text } from '@mantine/core';
import { IconBrandGithub, IconBug } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { UserMenu } from './components/UserMenu';
import { FooterLink } from './components/FooterLink';
import './App.css';

declare const __APP_VERSION__: string;

export default function App() {
  return (
    <AppShell
      header={{ height: 50 }}
      footer={{ height: 26 }}
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
