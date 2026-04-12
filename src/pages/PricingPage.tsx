import { Title, Text, Button, Stack, Group, Badge, List, ThemeIcon, Divider, Box } from '@mantine/core';
import { IconCheck, IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithGithub, logError } from '../lib/firebase';
import { fetchPricing, DEFAULT_PRICING, type PricingConfig } from '../lib/pricing';

export const BUY_PRO_URL = 'https://editsvgcode.com/pricing'; // replace with real PPG URL

function PlanCard({
  title, price, period, badge, credits, features, cta, onCta, highlight
}: {
  title: string;
  price: string;
  period?: string;
  badge?: string;
  credits: string;
  features: string[];
  cta: string;
  onCta?: () => void;
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
      }}
    >
      {badge && (
        <Badge color="blue" variant="filled" size="sm" style={{ position: 'absolute', top: -10, left: 16 }}>
          {badge}
        </Badge>
      )}
      <Stack gap="md">
        <div>
          <Text fw={700} size="lg">{title}</Text>
          <Group gap={4} align="baseline">
            <Text fw={800} size="2rem" lh={1}>{price}</Text>
            {period && <Text size="sm" c="dimmed">/{period}</Text>}
          </Group>
        </div>
        <Text size="sm" c="dimmed" fw={500}>{credits}</Text>
        <Divider />
        <List
          spacing={6}
          size="sm"
          icon={<ThemeIcon size={16} radius="xl" color="teal" variant="light"><IconCheck size={10} /></ThemeIcon>}
        >
          {features.map(f => <List.Item key={f}>{f}</List.Item>)}
        </List>
        <Button
          variant={highlight ? 'filled' : 'default'}
          onClick={onCta}
          fullWidth
        >
          {cta}
        </Button>
      </Stack>
    </Box>
  );
}

export function PricingPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const isAnonymous = !user || user.isAnonymous;
  const isPro = false; // TODO: read from credits context once available
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);

  useEffect(() => {
    fetchPricing().then(setPricing);
  }, []);

  const handleSignInGoogle = async () => {
    try { await signInWithGoogle(); navigate('/'); }
    catch (err) { logError('signInWithGoogle', err); }
  };

  const handleSignInGithub = async () => {
    try { await signInWithGithub(); navigate('/'); }
    catch (err) { logError('signInWithGithub', err); }
  };

  return (
    <Stack align="center" gap="xl" py="xl" px="md">
      <Stack align="center" gap="xs">
        <Title order={2}>Simple, transparent pricing</Title>
        <Text c="dimmed" size="md">Start for free. Upgrade when you need more.</Text>
      </Stack>

      <Group align="stretch" gap="lg" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <PlanCard
          title="Trial"
          price="Free"
          credits={`${pricing.anonymousTrialCredits} credits, one-time`}
          features={[
            'No sign-in',
            'All free-tier models',
            `~${pricing.anonymousTrialCredits} AI edits or ${Math.floor(pricing.anonymousTrialCredits / 10)} image gens`,

            'Credits never reset',
          ]}
          cta="Start editing"
          onCta={() => navigate('/')}
        />

        <PlanCard
          title="Free"
          price="Free"
          credits={`${pricing.freeMonthlyCredits} credits / month`}
          badge="Sign in required"
          features={[
            'Google or GitHub sign-in',
            'All free-tier models',
            `~${pricing.freeMonthlyCredits} AI edits or ${Math.floor(pricing.freeMonthlyCredits / 10)} image gens`,

            'Credits reset monthly',
            'Save files to cloud',
          ]}
          cta={isAnonymous ? 'Sign in with Google' : 'Current plan'}
          onCta={isAnonymous ? handleSignInGoogle : undefined}
          highlight={false}
        />

        <PlanCard
          title="Pro"
          price={`$${pricing.proMonthlyPriceUsd}`}
          period="month"
          badge="Best value"
          credits={`${pricing.proMonthlyCredits.toLocaleString()} credits / month`}
          features={[
            'Everything in Free',
            'Latest models (gpt-5.4, gpt-5.2-codex, etc.)',
            'Better image generation',
            `~${pricing.proMonthlyCredits.toLocaleString()} AI edits / month`,

            'Priority support',
          ]}
          cta={isPro ? 'Current plan' : 'Upgrade to Pro'}
          onCta={isPro ? undefined : () => window.open(BUY_PRO_URL, '_blank')}
          highlight
        />

        <PlanCard
          title="Credit Pack"
          price={`$${pricing.bulkPackPriceUsd}`}
          credits={`${pricing.bulkPackCredits.toLocaleString()} credits, one-time`}
          features={[
            'No subscription needed',
            'All pro models',
            'Never expire',
            'Top up any time',
          ]}
          cta="Buy credits"
          onCta={() => window.open(BUY_PRO_URL, '_blank')}
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
        Annual plan: ${pricing.proAnnualPriceUsd}/year (save 2 months). Credits do not roll over. No hidden fees.
      </Text>
    </Stack>
  );
}
