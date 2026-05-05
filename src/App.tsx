import { useEffect } from 'react';
import { AppShell, Group, Text, ActionIcon, Tooltip, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconBrandGithub, IconSun, IconMoon, IconBug } from '@tabler/icons-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserMenu } from './components/UserMenu';
import { FooterLink } from './components/FooterLink';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { trackPageView } from './lib/analytics';
import './App.css';

declare const __APP_VERSION__: string;

export default function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
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
            <Text fw={700} size="lg" c="inherit" component="a" href="/" className="app-header-title">Online SVG Code Editor</Text>
            <Group gap="sm" ml="lg">
              <Text size="sm" fw={500} c="inherit" component={Link} to="/features" style={{ textDecoration: 'none' }}>Features</Text>
              <Text size="sm" fw={500} c="inherit" component={Link} to="/pricing" style={{ textDecoration: 'none' }}>Upgrade</Text>
              <Text size="sm" fw={500} c="inherit" component={Link} to="/support" style={{ textDecoration: 'none' }}>Support</Text>
              <Text size="sm" fw={500} c="inherit" component={Link} to="/about" style={{ textDecoration: 'none' }}>About</Text>
            </Group>
          </Group>
          <Group gap="xs">
            <Tooltip label="Send feedback or report a bug">
              <ActionIcon variant="subtle" color="gray" size="lg" component="a" href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer" aria-label="Feedback">
                <IconBug size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={computedColorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleColorScheme} aria-label="Toggle color scheme">
                {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>
            <div style={{ width: 8 }} />
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
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/imprint">Imprint</FooterLink>
            <FooterLink href="/refund-policy">Refund Policy</FooterLink>
          </Group>
          <Group gap="xs">
            <FooterLink href="https://github.com/nbelyh/editsvgcode" target="_blank" rel="noopener noreferrer" icon={<IconBrandGithub size={14} />}>
              {' '}GitHub
            </FooterLink>
          </Group>
        </Group>
      </AppShell.Footer>

      <CookieConsentBanner />
    </AppShell>
  );
}
