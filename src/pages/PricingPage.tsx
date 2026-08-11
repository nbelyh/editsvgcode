import { Title, Text, Button, Stack, Group, Badge, List, ThemeIcon, Divider, Box, Anchor, Container, Table, Alert, Loader } from '@mantine/core';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { config } from '../lib/config';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useState, useEffect, useRef } from 'react';
import { trackBeginCheckout, trackViewPricing } from '../lib/analytics';
import { DEFAULT_PRICING } from '../lib/pricing';
import { buildCheckoutUrl, PPG_PRODUCT_IDS } from '../lib/ppg-checkout';
import { setPendingCheckout, takePendingCheckout, clearPendingCheckout, hasPendingCheckout } from '../lib/pending-checkout';
import { waitForAccount, settleProfile } from '../lib/wait-for-account';
import { PageMeta } from '../components/PageMeta';
import { metaFor } from '../lib/route-meta';

interface PlanCta {
  label: string;
  onClick?: () => void;
  variant?: 'filled' | 'default' | 'light';
}

function PlanCard({
  title, badge, credits, features, ctas, highlight, ctasDisabled
}: {
  title: string;
  badge?: string;
  credits: string;
  features: string[];
  ctas: PlanCta[];
  highlight?: boolean;
  /** Held while a parked purchase is on its way to checkout. */
  ctasDisabled?: boolean;
}) {
  return (
    <Box
      style={{
        border: `1px solid ${highlight ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-default-border)'}`,
        borderRadius: 'var(--mantine-radius-md)',
        padding: 'var(--mantine-spacing-xl)',
        flex: 1,
        minWidth: 220,
        maxWidth: 320,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {badge && (
        <Badge color="blue" variant="filled" size="sm" style={{ position: 'absolute', top: -10, left: 16 }}>
          {badge}
        </Badge>
      )}
      <Stack gap="md" style={{ flex: 1 }}>
        <Text fw={700} size="lg">{title}</Text>
        <Text size="sm" c="dimmed" fw={500}>{credits}</Text>
        <Divider />
        <List
          spacing={6}
          size="sm"
          style={{ flex: 1 }}
          icon={<ThemeIcon size={16} radius="xl" color="teal" variant="light"><IconCheck size={10} /></ThemeIcon>}
        >
          {features.map(f => <List.Item key={f}>{f}</List.Item>)}
        </List>
        <Stack gap="xs" mt="auto">
          {ctas.map(({ label, onClick, variant }) => (
            <Button key={label} variant={variant ?? 'default'} onClick={onClick} disabled={ctasDisabled} fullWidth>
              {label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

/** Loaded on demand so the module graph of this page never reaches lib/firebase:
 *  nobody signs in during a build-time render, and importing the sign-in path is
 *  what makes this page unrenderable on the server. */
function openSignInModal(message?: string, opts?: { onClose?: () => void }): void {
  import('../components/SignInModal')
    .then((m) => m.openSignInModal(message, opts))
    .catch((err) => {
      // No modal is going to open, so onClose will never run to clear a parked
      // purchase — and it would then hold the buttons on the next load for a
      // sign-in that never started. Undo it here instead.
      clearPendingCheckout();
      // console rather than logError: that lives in lib/firebase, and importing
      // it statically is the very thing that made this page unrenderable.
      console.error('[sign-in] modal failed to load', err);
    });
}

/** Whether this is running in a page at all. The build renders these components
 *  in Node to produce HTML for crawlers, and a few decisions here are only
 *  answerable in a browser. */
const IS_BROWSER = typeof window !== 'undefined';

type Product = Parameters<typeof buildCheckoutUrl>[0];

/** A parked purchase comes back out of storage as a bare string; an unknown name
 *  would build a checkout URL for a product that does not exist. hasOwnProperty
 *  rather than `in`, so "toString" is not mistaken for something we sell. */
function isProduct(value: string): value is Product {
  return Object.prototype.hasOwnProperty.call(PPG_PRODUCT_IDS, value);
}

export function PricingPage() {
  /** undefined until auth reports. "Nobody is signed in" and "we do not know yet"
   *  read the same otherwise, and parking a purchase for somebody who is already
   *  signed in sends them through an entire OAuth round trip for nothing. */
  const [user, setUser] = useState<User | null | undefined>(
    () => (IS_BROWSER ? getAuth().currentUser ?? undefined : undefined),
  );
  /** A purchase was parked before this load, so a redirect to checkout is coming.
   *  Known on the first render, so the buttons are not live for the moment before
   *  the buyer is taken away from them. */
  const [resuming, setResuming] = useState(hasPendingCheckout);
  /** The parked purchase, claimed once for this mounted page. StrictMode runs
   *  mount effects twice in development, and taking it inside the effect body
   *  would let the first pass consume it and the second find nothing — the
   *  resume would work in a production build and never once under npm run dev. */
  const claimed = useRef<string | null | undefined>(undefined);
  const pricing = DEFAULT_PRICING;

  useEffect(() => {
    trackViewPricing();
  }, []);

  useEffect(() => onAuthStateChanged(getAuth(), setUser), []);

  // Resume the purchase the sign-in gate interrupted. Without this the gate
  // ended the attempt: the buyer came back signed in and nothing happened.
  //
  // The account is waited for rather than read once. Coming back from the
  // provider the user is still anonymous for a moment — the credential is
  // attached before the in-memory user reflects it — so reading auth at any
  // single instant answers "a guest" and throws the purchase away.
  useEffect(() => {
    let cancelled = false;
    if (claimed.current === undefined) claimed.current = takePendingCheckout();
    const parked = claimed.current;
    if (!parked || !isProduct(parked)) {
      setResuming(false);
      return;
    }
    (async () => {
      const found = await waitForAccount();
      if (cancelled) return;
      if (!found) {
        setResuming(false);
        return;
      }
      // Navigating the instant the account appears cuts off the profile write
      // that is still landing, losing the name for good and leaving checkout
      // with nothing to prefill. Brief, bounded, and skipped when there is
      // already a name.
      const account = await settleProfile(found);
      if (cancelled) return;
      // Counted here because checkout() returned at the gate without counting:
      // this is the one and only begin_checkout for a buyer who had to sign in,
      // which is most of them.
      trackBeginCheckout(parked);
      window.location.href = buildCheckoutUrl(parked, {
        uid: account.uid, email: account.email, displayName: account.displayName,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const authPending = user === undefined;
  const isAnonymous = !user || user.isAnonymous; // Only meaningful once auth reports.
  const isPro = false; // TODO: read from credits context once available

  function checkout(product: Product) {
    if (authPending) return; // Buttons are held meanwhile; this is a backstop.
    // Require a real (non-anonymous) account before purchase. An anonymous UID
    // is tied to browser storage — a purchase made while anonymous is lost the
    // moment the user clears cookies, and the backend gates Pro models on the
    // sign-in provider, so anonymous Pro buyers can't use what they paid for.
    if (isAnonymous) {
      // Parked in sessionStorage rather than held in memory: sign-in is a
      // redirect, so the page leaves for the provider and comes back a new
      // document with nothing of this one left to resume from.
      setPendingCheckout(product);
      openSignInModal(undefined, {
        // Dismissal only — picking a provider navigates away before this fires,
        // so reaching here means they abandoned it and the purchase goes too.
        onClose: clearPendingCheckout,
      });
      return;
    }
    trackBeginCheckout(product);
    window.open(buildCheckoutUrl(product, { uid: user?.uid, email: user?.email, displayName: user?.displayName }), '_blank');
  }

  const isBeta = IS_BROWSER
    && (config.FIREBASE_PROJECT_ID === 'editsvgcode-beta' || config.FIREBASE_AUTH_DOMAIN === 'localhost');

  return (
    <Stack align="center" gap="xl" pb="xl" pt="md" px="md" className="page-scroll">
      <PageMeta {...metaFor('/pricing')} />
      {isBeta && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light" style={{ maxWidth: 700, width: '100%', flexShrink: 0 }}>
          <strong>Beta:</strong> payments are disabled — upgrade buttons are for preview only.
        </Alert>
      )}
      {resuming && (
        <Alert icon={<Loader size={16} />} color="blue" variant="light" style={{ maxWidth: 700, width: '100%', flexShrink: 0 }}>
          <Text size="sm">Taking you to checkout — one moment.</Text>
        </Alert>
      )}
      <Stack align="center" gap="xs">
        <Title order={2}>AI assistant pricing</Title>
        <Text c="dimmed" size="md" ta="center">
          The SVG editor is free for everyone — no account, no payment needed.<br />
          The optional AI assistant runs on credits, and every account gets {pricing.freeMonthlyCredits} free each month — you only pay if you need more. <Anchor size="md" onClick={(e: React.MouseEvent) => { e.preventDefault(); document.getElementById('how-credits-work')?.scrollIntoView({ behavior: 'smooth' }); }}>How do credits work?</Anchor>
        </Text>
      </Stack>

      <Group align="stretch" gap="lg" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <PlanCard
          ctasDisabled={resuming || (IS_BROWSER && authPending)}
          title="Free"
          credits={`${pricing.freeMonthlyCredits} credits / month`}
          features={[
            'Google / GitHub / Microsoft sign-in',
            'Only -mini models',
            `~${pricing.freeMonthlyCredits} AI edits or ${Math.floor((pricing.freeMonthlyCredits - 1) / 10)} image gens`,
            `AI SVG size limit: ${pricing.maxSvgCharsFree / 1000}K chars`,
            'Credits reset monthly',
            'Save files to cloud',
            'Private or public files',
            'Files are not indexed',
          ]}
          ctas={isAnonymous
            ? [{ label: 'Sign in', onClick: () => openSignInModal() }]
            : [{ label: 'Current plan' }]
          }
        />

        <PlanCard
          ctasDisabled={resuming || (IS_BROWSER && authPending)}
          title="Pro"
          badge="Most popular"
          credits={`${pricing.proMonthlyCredits.toLocaleString()} credits / month`}
          features={[
            'Everything in Free',
            'All models (gpt-5.6-sol, gpt-5.4, etc.)',
            'AI SVG size up to 1MB',
            'Full AI image-gen models',
            'Priority support',
          ]}
          highlight
          ctas={isPro ? [{ label: 'Current plan' }] : [
            { label: `Monthly — $10/mo`, variant: 'filled', onClick: () => checkout('pro-monthly') },
            { label: `Annual — $8/mo ($96/yr)`, variant: 'light', onClick: () => checkout('pro-annual') },
          ]}
        />

        <PlanCard
          ctasDisabled={resuming || (IS_BROWSER && authPending)}
          title="Credit Packs"
          credits="One-time, never expire"
          features={[
            'No subscription needed',
            'Works with any plan',
            'Top up any time',
          ]}
          ctas={[
            { label: `100 credits — $5`, onClick: () => checkout('credits-100') },
            { label: `300 credits — $10`, onClick: () => checkout('credits-300') },
            { label: `1,000 credits — $15`, onClick: () => checkout('credits-1000') },
          ]}
        />
      </Group>

      <Container size="sm" py="xl">
        <Stack gap="xl">
          <Divider />

          <Title order={3} id="how-credits-work">How credits work</Title>
          <Text size="sm">
            Credits are a virtual currency used by AI features — chat, code editing, and image generation.
            Each AI request costs a fixed number of credits depending on the model:
          </Text>
          <Table highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Model tier</Table.Th>
                <Table.Th>Examples</Table.Th>
                <Table.Th>Credits per request</Table.Th>
                <Table.Th>Free (50/mo)</Table.Th>
                <Table.Th>Pro (1,000/mo)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Mini models</Table.Td>
                <Table.Td>gpt-5.4-nano, gpt-5.4-mini</Table.Td>
                <Table.Td>1 – 3</Table.Td>
                <Table.Td>~15–50 edits</Table.Td>
                <Table.Td>~300–1,000 edits</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Full-size models</Table.Td>
                <Table.Td>gpt-5.6-luna, gpt-5.4, gpt-5.6-sol</Table.Td>
                <Table.Td>8 – 40</Table.Td>
                <Table.Td>~1–6 edits</Table.Td>
                <Table.Td>~25–125 edits</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Image generation</Table.Td>
                <Table.Td>gpt-image-1-mini, gpt-image-1</Table.Td>
                <Table.Td>10 – 50</Table.Td>
                <Table.Td>~1–5 images</Table.Td>
                <Table.Td>~20–100 images</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <Text size="sm">
            The exact credit cost for each model is shown in the editor interface before you send a request.
          </Text>

          <Title order={3}>Monthly credits & billing</Title>
          <List size="sm" spacing="xs">
            <List.Item>Free and Pro tiers receive a monthly credit allowance that <strong>resets on your billing anniversary date</strong> (the day you signed up or subscribed).</List.Item>
            <List.Item>Monthly credits <strong>do not roll over</strong> — unused credits expire at the start of each new billing period.</List.Item>
            <List.Item>Pro subscriptions auto-renew until cancelled. You can cancel at any time; Pro features remain active until the end of the paid period.</List.Item>
          </List>

          <Title order={3}>Credit packs</Title>
          <List size="sm" spacing="xs">
            <List.Item>Credit packs are a one-time purchase — <strong>no subscription required</strong>.</List.Item>
            <List.Item>Pack credits <strong>never expire</strong> and persist across billing periods.</List.Item>
            <List.Item>When credits are consumed, pack credits are used first before your monthly allowance.</List.Item>
            <List.Item>Pack credits are retained even if your subscription ends.</List.Item>
          </List>

          <Title order={3}>Payments & Merchant of Record</Title>
          <Text size="sm">
            All purchases are processed by{' '}
            <Anchor href="https://payproglobal.com" target="_blank" rel="noopener noreferrer">PayPro Global, Inc.</Anchor>,
            which acts as the Merchant of Record. PayPro Global is the legal seller of record —
            your invoice, payment, and purchase agreement are with them. They handle payment processing,
            global tax calculation, invoicing, and billing-related customer support.
          </Text>

          <Title order={3}>Refunds</Title>
          <List size="sm" spacing="xs">
            <List.Item>You may request a full refund within <strong>30 days</strong> of purchase (subscriptions and unused credit packs).</List.Item>
            <List.Item>Credit packs are non-refundable once any credits from the pack have been used.</List.Item>
            <List.Item>Refunds are processed by PayPro Global. Contact{' '}
              <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>{' '}
              or use the{' '}
              <Anchor href="https://cc.payproglobal.com/Customer/Account/Login" target="_blank" rel="noopener noreferrer">
                PayPro Global customer portal
              </Anchor>.
            </List.Item>
          </List>

          <Text size="xs" c="dimmed">
            See also: <Anchor href="/terms" size="xs">Terms of Service</Anchor> · <Anchor href="/refund-policy" size="xs">Refund Policy</Anchor> · <Anchor href="/privacy" size="xs">Privacy Policy</Anchor>
          </Text>
        </Stack>
      </Container>
    </Stack>
  );
}
