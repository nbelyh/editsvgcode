import { useEffect, useState } from 'react';
import { APP_SHELL_HEADER_HEIGHT, DESKTOP_QUERY, NAV_DRAWER_QUERY } from './lib/app-shell';
import { AppShell, Group, Text, ActionIcon, Tooltip, useMantineColorScheme, useComputedColorScheme, Burger, Drawer, Stack, Divider, Button } from '@mantine/core';
import { useDisclosure, useMediaQuery, useElementSize } from '@mantine/hooks';
import { IconBrandGithub, IconSun, IconMoon, IconBug, IconSparkles } from '@tabler/icons-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserMenu } from './components/UserMenu';
import { FooterLink } from './components/FooterLink';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { trackPageView } from './lib/analytics';
import { hasResponded, consentRequired } from './lib/cookie-consent';
import { enableAnalytics } from './lib/firebase';
import './App.css';

declare const __APP_VERSION__: string;

const BLOG_PATH = '/blog';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/gallery', label: 'Gallery' },
  { to: BLOG_PATH, label: 'Blog' },
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

  // Only visitors from countries that require it are asked (see consentRequired).
  // Hidden until that is known, so nobody elsewhere sees the banner flash up.
  const [consentPending, setConsentPending] = useState(false);
  useEffect(() => {
    if (hasResponded()) return;
    let cancelled = false;
    consentRequired().then(required => {
      if (cancelled) return;
      if (required) setConsentPending(true);
      else enableAnalytics();
    });
    return () => { cancelled = true; };
  }, []);
  // The consent notice lives in the footer. On the desktop layout it fits
  // beside the links; below that it takes a row of its own above them, sized
  // to however many lines its sentence wraps to — measured, since that runs
  // from one line on a tablet to three on a 320px phone. Where the header has
  // the burger, the legal links are in its drawer, and the notice row stands
  // alone.
  const isDesktop = useMediaQuery(DESKTOP_QUERY, undefined, { getInitialValueInEffect: false });
  const hasNavDrawer = useMediaQuery(NAV_DRAWER_QUERY, undefined, { getInitialValueInEffect: false });
  const consentDocked = consentPending && !isDesktop;
  const { ref: noticeRef, height: noticeHeight } = useElementSize();
  const LINKS_ROW = 26;
  const NOTICE_PADDING = 6;
  const footerHeight = !consentPending ? LINKS_ROW
    : !consentDocked ? 36
    : Math.max(36, Math.ceil(noticeHeight) + 2 * NOTICE_PADDING) + (hasNavDrawer ? 0 : LINKS_ROW);

  const legalLinks = (
    <>
      <FooterLink href={BLOG_PATH} title="See what changed in this release">v{__APP_VERSION__}</FooterLink>
      <FooterLink href="https://unmanagedvisio.com" target="_blank" title="Visit UnmanagedVisio website">© UnmanagedVisio</FooterLink>
      <FooterLink href="/privacy" title="Read our privacy policy">Privacy Policy</FooterLink>
      <FooterLink href="/terms" title="Read the terms of service">Terms of Service</FooterLink>
      <FooterLink href="/imprint" title="Legal information">Imprint</FooterLink>
      <FooterLink href="/refund-policy" title="Read the refund policy">Refund Policy</FooterLink>
      {Date.now() < new Date('2026-07-11').getTime() && (
        <FooterLink href="https://editsvgcode-legacy.web.app" target="_blank" title="The legacy version of the editor (available until July 2026)">Legacy version</FooterLink>
      )}
    </>
  );

  return (
    <AppShell
      header={{ height: APP_SHELL_HEADER_HEIGHT }}
      footer={{ height: footerHeight }}
      padding={0}
    >
      {/* keepMounted: without it the drawer's contents mount for the first
          time inside the tap that opens it, and on a mid-range phone that
          first mount is half the tap's latency — 152ms cold against 80ms
          once warm, measured at 4x CPU throttling. That is the interaction
          Search Console flags for INP on mobile. Mounting once at load, at
          React's hidden-Activity priority, leaves the tap only the cheap
          part. */}
      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title={<Text fw={700}>Online SVG Code Editor</Text>}
        size="xs"
        hiddenFrom="sm"
        keepMounted
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
          <Button
              component={Link}
              to="/pricing"
              variant="filled"
              leftSection={<IconSparkles size={14} />}
            >Upgrade</Button>
          <Divider />
          <Button
            component="a"
            href="https://github.com/nbelyh/editsvgcode/issues"
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            color="gray"
            leftSection={<IconBug size={16} />}
            justify="left"
          >
            Send feedback
          </Button>
          <Button
            variant="subtle"
            color="gray"
            leftSection={computedColorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            justify="left"
            onClick={toggleColorScheme}
          >
            {computedColorScheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
          {/* On a phone the footer is too narrow for these — the row was cut
              off after Privacy Policy, and the consent notice takes it over
              entirely until answered — so they are here as well. */}
          <Divider />
          <Group gap="sm" px="xs">
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/imprint">Imprint</FooterLink>
            <FooterLink href="/refund-policy">Refund Policy</FooterLink>
          </Group>
        </Stack>
      </Drawer>

      <AppShell.Header className="app-chrome">
        <Group h="100%" px="sm" justify="space-between">
          <Group gap="sm">
            {/* width too: without it the box is 0px wide until the SVG decodes,
                and the title beside it shifts. */}
            <img src="/editsvgcode-logo.svg" alt="Logo" width={28} height={28} />
            <Text fw={700} size="lg" c="inherit" component="a" href="/" className="app-header-title" visibleFrom="sm">Online SVG Code Editor</Text>
            <Text fw={700} size="lg" c="inherit" component="a" href="/" className="app-header-title" hiddenFrom="sm">SVG Code Editor</Text>
            <Group gap="sm" ml="lg" visibleFrom="sm">
              {NAV_LINKS.map(link => (
                <Text key={link.to} size="sm" fw={500} c="inherit" component={Link} to={link.to} style={{ textDecoration: 'none' }}>{link.label}</Text>
              ))}
            </Group>
          </Group>
          <Group gap="xs">
            <Button
              component={Link}
              to="/pricing"
              size="xs"
              variant="filled"
              leftSection={<IconSparkles size={12} />}
              visibleFrom="sm"
              style={{ paddingInline: 10, height: 28, fontWeight: 600 }}
            >Upgrade</Button>
            <Tooltip label="Send feedback or report a bug">
              <ActionIcon variant="subtle" color="gray" size="lg" component="a" href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer" aria-label="Feedback" visibleFrom="sm">
                <IconBug size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={computedColorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleColorScheme} aria-label="Toggle color scheme" visibleFrom="sm">
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
        {consentDocked ? (
          <>
            <div ref={noticeRef} style={{ display: 'flex', padding: `${NOTICE_PADDING}px 10px` }}>
              <CookieConsentBanner onAnswered={() => setConsentPending(false)} />
            </div>
            {!hasNavDrawer && (
              <Group h={LINKS_ROW} px="xs" gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>{legalLinks}</Group>
            )}
          </>
        ) : (
          <Group h="100%" px="xs" justify="space-between">
            <Group gap="xs">
              {legalLinks}
            </Group>
            <Group gap="xs">
              {consentPending ? (
                <CookieConsentBanner onAnswered={() => setConsentPending(false)} />
              ) : (
                <FooterLink href="https://github.com/nbelyh/editsvgcode" target="_blank" rel="noopener noreferrer" icon={<IconBrandGithub size={14} />} title="View source code on GitHub">
                  {' '}GitHub
                </FooterLink>
              )}
            </Group>
          </Group>
        )}
      </AppShell.Footer>

    </AppShell>
  );
}


