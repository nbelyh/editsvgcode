import { Title, Text, Button, Stack, Group, Badge, List, ThemeIcon, Divider, Box } from '@mantine/core';
import { IconCheck, IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithGithub, logError } from '../lib/firebase';
import { fetchPricing, DEFAULT_PRICING, type PricingConfig } from '../lib/pricing';
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
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    fetchPricing().then(setPricing);
  }, []);

  const isAnonymous = !user || user.isAnonymous;
  const isPro = false; // TODO: read from credits context once available

  function checkout(product: Parameters<typeof buildCheckoutUrl>[0]) {
    window.open(buildCheckoutUrl(product, { uid: user?.uid, email: user?.email, displayName: user?.displayName }), '_blank');
  }

  const handleSignInGoogle = async () => {
    try { await signInWithGoogle(); navigate('/'); }
    catch (err) { logError('signInWithGoogle', err); }
  };

  const handleSignInGithub = async () => {
    try { await signInWithGithub(); navigate('/'); }
    catch (err) { logError('signInWithGithub', err); }
  };

  return (
    <Stack align="center" gap="xl" py="xl" px="md" style={{ overflow: 'auto', height: '100%' }}>
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
            'Credits reset monthly',
            'Save files to cloud',
          ]}
          ctas={isAnonymous
            ? [{ label: 'Sign in with Google', onClick: handleSignInGoogle }]
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
            'Better image generation',
            'Priority support',
          ]}
          highlight
          ctas={isPro ? [{ label: 'Current plan' }] : [
            { label: `Monthly — $${pricing.proMonthlyPriceUsd}/mo`, variant: 'filled', onClick: () => checkout('pro-monthly') },
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

      <Text size="xs" c="dimmed">
        Credits do not roll over. No hidden fees.
      </Text>
    </Stack>
  );
}
