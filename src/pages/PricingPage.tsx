import { Title, Text, Button, Stack, Group, Badge, List, ThemeIcon, Divider, Box, Anchor, Container, Table, Alert } from '@mantine/core';
import { IconCheck, IconBrandGoogle, IconBrandGithub, IconInfoCircle } from '@tabler/icons-react';
import { config } from '../lib/config';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithGithub, logError } from '../lib/firebase';
import { trackSignIn, trackBeginCheckout } from '../lib/analytics';
import { DEFAULT_PRICING } from '../lib/pricing';
import { buildCheckoutUrl } from '../lib/ppg-checkout';

interface PlanCta {
  label: string;
  onClick?: () => void;
  variant?: 'filled' | 'default' | 'light';
}

function PlanCard({
  title, badge, credits, features, ctas, highlight
}: {
  title: string;
  badge?: string;
  credits: string;
  features: string[];
  ctas: PlanCta[];
  highlight?: boolean;
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
            <Button key={label} variant={variant ?? 'default'} onClick={onClick} fullWidth>
              {label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export function PricingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const pricing = DEFAULT_PRICING;

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);
    return onAuthStateChanged(auth, setUser);
  }, []);

  const isAnonymous = !user || user.isAnonymous;
  const isPro = false; // TODO: read from credits context once available

  function checkout(product: Parameters<typeof buildCheckoutUrl>[0]) {
    trackBeginCheckout(product);
    window.open(buildCheckoutUrl(product, { uid: user?.uid, email: user?.email, displayName: user?.displayName }), '_blank');
  }

  const handleSignInGoogle = async () => {
    try { await signInWithGoogle(); trackSignIn('google'); navigate('/'); }
    catch (err) { logError('signInWithGoogle', err); }
  };

  const handleSignInGithub = async () => {
    try { await signInWithGithub(); trackSignIn('github'); navigate('/'); }
    catch (err) { logError('signInWithGithub', err); }
  };

  const isBeta = config.FIREBASE_PROJECT_ID === 'editsvgcode-beta' || config.FIREBASE_AUTH_DOMAIN === 'localhost';

  return (
    <Stack align="center" gap="xl" pb="xl" pt="md" px="md" className="page-scroll">
      {isBeta && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light" style={{ maxWidth: 700, width: '100%', flexShrink: 0 }}>
          <strong>Beta:</strong> payments are disabled — upgrade buttons are for preview only.
        </Alert>
      )}
      <Stack align="center" gap="xs">
        <Title order={2}>Simple, transparent pricing</Title>
        <Text c="dimmed" size="md">Start for free. Upgrade when you need more.</Text>
      </Stack>

      <Group align="stretch" gap="lg" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <PlanCard
          title="Anonymous"
          credits={`${pricing.anonymousTrialCredits} credits, one-time`}
          features={[
            'Only -mini models',
            `~${pricing.anonymousTrialCredits} AI edits or ${Math.floor((pricing.anonymousTrialCredits - 1) / 10)} image gen`,
            `AI SVG size limit: ${pricing.maxSvgCharsFree / 1000}K chars`,
            'Credits never reset',
          ]}
          ctas={[{ label: 'Start editing', onClick: () => navigate('/') }]}
        />

        <PlanCard
          title="Free"
          credits={`${pricing.freeMonthlyCredits} credits / month`}
          features={[
            'Google or GitHub sign-in',
            'Only -mini models',
            `~${pricing.freeMonthlyCredits} AI edits or ${Math.floor((pricing.freeMonthlyCredits - 1) / 10)} image gens`,
            `AI SVG size limit: ${pricing.maxSvgCharsFree / 1000}K chars`,
            'Credits reset monthly',
            'Save files to cloud',
          ]}
          ctas={isAnonymous
            ? [
                { label: 'Sign in with Google', onClick: handleSignInGoogle },
                { label: 'Sign in with GitHub', onClick: handleSignInGithub },
              ]
            : [{ label: 'Current plan' }]
          }
        />

        <PlanCard
          title="Pro"
          badge="Most popular"
          credits={`${pricing.proMonthlyCredits.toLocaleString()} credits / month`}
          features={[
            'Everything in Free',
            'All models (gpt-5.4, gpt-5.2-codex, etc.)',
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

      {isAnonymous && (
        <Stack align="center" gap="xs">
          <Text size="sm" c="dimmed">Sign in to unlock 100 free credits/month</Text>
          <Group gap="sm">
            <Button leftSection={<IconBrandGoogle size={16} />} variant="default" onClick={handleSignInGoogle}>
              Sign in with Google
            </Button>
            <Button leftSection={<IconBrandGithub size={16} />} variant="default" onClick={handleSignInGithub}>
              Sign in with GitHub
            </Button>
          </Group>
        </Stack>
      )}

      <Container size="sm" py="xl">
        <Stack gap="xl">
          <Divider />

          <Title order={3}>How credits work</Title>
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
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Mini models</Table.Td>
                <Table.Td>gpt-4.1-mini, gpt-5-mini</Table.Td>
                <Table.Td>1 – 3</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Full-size models</Table.Td>
                <Table.Td>gpt-4.1, gpt-5, gpt-5.2-codex</Table.Td>
                <Table.Td>5 – 20</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Image generation</Table.Td>
                <Table.Td>gpt-image-1-mini, gpt-image-1</Table.Td>
                <Table.Td>10 – 50</Table.Td>
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
