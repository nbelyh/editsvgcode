import { Text, Tooltip } from '@mantine/core';
import { Link } from 'react-router-dom';

export const BUY_CREDITS_URL = '/pricing';

export function CreditsIndicator({ remaining, limit, packCredits, creditsByModel, isAnonymous, rechargeAt }: { remaining: number; limit: number; packCredits?: number; creditsByModel?: Record<string, number>; isAnonymous?: boolean; rechargeAt?: string }) {
  const size = 18;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const effectiveLimit = limit + (packCredits ?? 0);
  const ratio = Math.min(remaining / effectiveLimit, 1);
  const offset = circumference * (1 - ratio);
  const color = ratio <= 0 ? 'var(--mantine-color-red-filled)' : ratio <= 0.2 ? 'var(--mantine-color-yellow-filled)' : 'var(--mantine-primary-color-filled)';
  const depleted = remaining <= 0;
  const modelEntries = creditsByModel
    ? Object.entries(creditsByModel).sort(([, a], [, b]) => b - a)
    : [];
  const label = depleted ? (
    <Text size="sm">{isAnonymous ? 'Guest credits used — sign in for 100 free credits/month' : 'No credits remaining — click to buy more'}</Text>
  ) : (
    <div>
      <Text size="sm" fw={600}>{remaining} / {effectiveLimit} credits remaining</Text>
      {rechargeAt && (
        <Text size="sm" c="dimmed" mt={2}>Recharges {new Date(rechargeAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</Text>
      )}
      {modelEntries.length > 0 && (
        <>
          <Text size="sm" c="dimmed" mt={4}>{isAnonymous ? 'Spent (trial):' : 'Spent this month:'}</Text>
          {modelEntries.map(([model, spent]) => (
            <Text size="sm" key={model} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>{model}</span>
              <span>{spent}</span>
            </Text>
          ))}
        </>
      )}
    </div>
  );
  const indicator = (
    <svg width={size} height={size} style={{ display: 'block', cursor: depleted ? 'pointer' : 'default' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mantine-color-default-border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
  return (
    <Tooltip label={label} multiline w={modelEntries.length > 0 ? 220 : (isAnonymous && depleted ? 280 : undefined)}>
      {depleted && !isAnonymous ? (
        <Link to={BUY_CREDITS_URL} style={{ display: 'block', lineHeight: 0 }}>
          {indicator}
        </Link>
      ) : indicator}
    </Tooltip>
  );
}
