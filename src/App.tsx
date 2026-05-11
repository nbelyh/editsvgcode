import { useEffect } from 'react';
import { AppShell, Group, Text, ActionIcon, Tooltip, useMantineColorScheme, useComputedColorScheme, Burger, Drawer, Stack, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandGithub, IconSun, IconMoon, IconBug } from '@tabler/icons-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserMenu } from './components/UserMenu';
import { FooterLink } from './components/FooterLink';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { trackPageView } from './lib/analytics';
import './App.css';

declare const __APP_VERSION__: string;

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Upgrade' },
  { to: '/support', label: 'Support' },
  { to: '/about', label: 'About' },
];

export default function App() {
  const location = useLocation();
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

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
      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title={<Text fw={700}>Online SVG Code Editor</Text>}
        size="xs"
        hiddenFrom="sm"
      >
        <Stack gap="xs">
          {NAV_LINKS.map(link => (
            <Text
              key={link.to}
              size="md"
              fw={500}
              component={Link}
              to={link.to}
              style={{ textDecoration: 'none' }}
              c="inherit"
              p="xs"
            >
              {link.label}
            </Text>
          ))}
          <Divider />
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            component="a"
            href="https://github.com/nbelyh/editsvgcode/issues"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Feedback"
          >
            <IconBug size={20} />
            <Text size="sm" ml="xs">Send feedback</Text>
          </ActionIcon>
        </Stack>
      </Drawer>

      <AppShell.Header className="app-chrome">
        <Group h="100%" px="sm" justify="space-between">
          <Group gap="sm">
            <img src="/editsvgcode-logo.svg" alt="Logo" height={28} />
            <Text fw={700} size="lg" c="inherit" component="a" href="/" className="app-header-title" visibleFrom="sm">Online SVG Code Editor</Text>
            <Text fw={700} size="lg" c="inherit" component="a" href="/" className="app-header-title" hiddenFrom="sm">SVG Code Editor</Text>
            <Group gap="sm" ml="lg" visibleFrom="sm">
              {NAV_LINKS.map(link => (
                <Text key={link.to} size="sm" fw={500} c="inherit" component={Link} to={link.to} style={{ textDecoration: 'none' }}>{link.label}</Text>
              ))}
            </Group>
          </Group>
          <Group gap="xs">
            <Tooltip label="Send feedback or report a bug">
              <ActionIcon variant="subtle" color="gray" size="lg" component="a" href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer" aria-label="Feedback" visibleFrom="sm">
                <IconBug size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={computedColorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleColorScheme} aria-label="Toggle color scheme">
                {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>
            <div style={{ width: 4 }} />
            <UserMenu />
            <Burger opened={drawerOpen} onClick={openDrawer} hiddenFrom="sm" size="sm" aria-label="Open navigation" />
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
            <FooterLink href="https://unmanagedvisio.com" target="_blank" title="Visit UnmanagedVisio website">© UnmanagedVisio</FooterLink>
            <FooterLink href="/privacy" title="Read our privacy policy">Privacy Policy</FooterLink>
            <FooterLink href="/terms" title="Read the terms of service">Terms of Service</FooterLink>
            <FooterLink href="/imprint" title="Legal information">Imprint</FooterLink>
            <FooterLink href="/refund-policy" title="Read the refund policy">Refund Policy</FooterLink>
            {Date.now() < new Date('2026-07-11').getTime() && (
              <FooterLink href="https://editsvgcode-legacy.web.app" target="_blank" title="The legacy version of the editor (available until July 2026)">Legacy version</FooterLink>
            )}
          </Group>
          <Group gap="xs">
            <FooterLink href="https://github.com/nbelyh/editsvgcode" target="_blank" rel="noopener noreferrer" icon={<IconBrandGithub size={14} />} title="View source code on GitHub">
              {' '}GitHub
            </FooterLink>
          </Group>
        </Group>
      </AppShell.Footer>

      <CookieConsentBanner />
    </AppShell>
  );
}


