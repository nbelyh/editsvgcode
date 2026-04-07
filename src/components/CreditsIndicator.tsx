import { Tooltip } from '@mantine/core';

/** Placeholder — replace with real PayProGlobal / pricing page URL. */
export const BUY_CREDITS_URL = '/pricing';

export function CreditsIndicator({ remaining, limit }: { remaining: number; limit: number }) {
  const size = 18;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(remaining / limit, 1);
  const offset = circumference * (1 - ratio);
  const color = ratio <= 0 ? 'var(--mantine-color-red-filled)' : ratio <= 0.2 ? 'var(--mantine-color-yellow-filled)' : 'var(--mantine-primary-color-filled)';
  const depleted = remaining <= 0;
  const label = depleted
    ? 'No credits remaining — click to buy more'
    : `${remaining} / ${limit} credits remaining`;
  const indicator = (
    <svg width={size} height={size} style={{ display: 'block', cursor: depleted ? 'pointer' : 'default' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mantine-color-default-border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
  return (
    <Tooltip label={label}>
      {depleted ? (
        <a href={BUY_CREDITS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block', lineHeight: 0 }}>
          {indicator}
        </a>
      ) : indicator}
    </Tooltip>
  );
}
