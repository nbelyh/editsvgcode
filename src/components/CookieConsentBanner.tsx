import { Group, Text, Button } from '@mantine/core';
import { setConsent } from '../lib/cookie-consent';
import { enableAnalytics, disableAnalytics } from '../lib/firebase';

interface CookieConsentBannerProps {
  /** Called once the visitor has answered, so the layout can stop making room for the notice. */
  onAnswered: () => void;
}

/**
 * One line in the footer, not a card over the page: as a floating card with a
 * blue Accept it was the loudest thing on screen, and on a phone it sat on the
 * chat box, the only input. App places it: beside the footer links on wide
 * screens, in their place below that.
 *
 * Quiet in place, but not faint: consent only counts if the visitor saw the
 * question, so the text is in the body colour, not the footer's muted one.
 * Accept is the primary button, as it was on the card; Decline stays a full
 * button beside it, on the same line, never a link or a second step.
 */
export function CookieConsentBanner({ onAnswered }: CookieConsentBannerProps) {
  const handleAccept = () => {
    setConsent('accepted');
    enableAnalytics();
    onAnswered();
  };

  const handleDecline = () => {
    setConsent('declined');
    disableAnalytics();
    onAnswered();
  };

  return (
    <Group justify="space-between" wrap="nowrap" gap="xs" style={{ flex: 1, minWidth: 0 }}>
      <Text size="sm" c="var(--mantine-color-text)" lh={1.3}>
        This website uses cookies for analytics.{' '}
        <Text component="a" href="/privacy" size="sm" td="underline" c="blue">Learn more</Text>
      </Text>
      <Group gap={6} wrap="nowrap">
        <Button size="compact-sm" variant="default" onClick={handleDecline}>Decline</Button>
        <Button size="compact-sm" onClick={handleAccept}>Accept</Button>
      </Group>
    </Group>
  );
}
