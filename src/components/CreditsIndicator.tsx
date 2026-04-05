import { Tooltip } from '@mantine/core';

export function CreditsIndicator({ remaining, limit }: { remaining: number; limit: number }) {
  const size = 18;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(remaining / limit, 1);
  const offset = circumference * (1 - ratio);
  const color = ratio <= 0 ? 'var(--mantine-color-red-filled)' : ratio <= 0.2 ? 'var(--mantine-color-yellow-filled)' : 'var(--mantine-primary-color-filled)';
  const label = `${remaining} / ${limit} credits remaining`;
  return (
    <Tooltip label={label}>
      <svg width={size} height={size} style={{ display: 'block', cursor: 'default' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mantine-color-default-border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
    </Tooltip>
  );
}
