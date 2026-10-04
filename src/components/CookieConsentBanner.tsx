import { Group, Text, Button, Paper } from '@mantine/core';
import { setConsent } from '../lib/cookie-consent';
import { enableAnalytics, disableAnalytics } from '../lib/firebase';

interface CookieConsentBannerProps {
  /** Called once the visitor has answered, so the layout can stop making room for the notice. */
  onAnswered: () => void;
  /**
   * A card floating over the bottom of the page, for desktop and tablet. There
   * is room for it there, and folded into the footer it was too easy to miss —
   * consent only counts if the visitor saw the question.
   */
  floating?: boolean;
  /** Pixels at the right edge the floating card must leave uncovered: the
   *  tablet layout's AI chat column, which a centred card sat on. */
  keepClearRight?: number;
}

/**
 * On a phone it is a row in the footer instead (App places it): as a floating
 * card it sat on the chat box, a phone's only input.
 * Decline is always a full button beside Accept, never a link or a second step.
 */
export function CookieConsentBanner({ onAnswered, floating, keepClearRight = 0 }: CookieConsentBannerProps) {
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

  if (floating) {
    return (
      <Paper
        shadow="md"
        p="sm"
        withBorder
        className="cookie-notice"
        style={{
          position: 'fixed',
          bottom: 30,
          // Centred in whatever is left of the protected column.
          left: `calc((100% - ${keepClearRight}px) / 2)`,
          transform: 'translateX(-50%)',
          // Below Mantine's modal layer (200). At 1000 this sat on top of every
          // dialog and, being fixed to the bottom, silently swallowed clicks on
          // the footer buttons of any dialog tall enough to reach it.
          zIndex: 190,
          maxWidth: 640,
          width: `calc(100% - ${keepClearRight}px - 32px)`,
        }}
      >
        {/* Room on a wide screen to say plainly what the cookies do, instead of
            a bare "uses cookies". Facts only, no appeal: a pitch reads as a
            trick. Every claim here is in the privacy policy. */}
        {/* The buttons drop below the text when the card is narrow (a tablet,
            where it keeps clear of the chat column) rather than squeezing the
            sentence into a tall thin column beside them. */}
        <Group justify="space-between" wrap="wrap" gap="md">
          <div style={{ flex: '1 1 340px' }}>
            <Text size="sm" fw={600}>Cookie Usage</Text>
            <Text size="sm">
              This site uses Google Analytics to count visits and see which features are used. The data is anonymized and not sold. The editor works the same whether you accept or decline.{' '}
              <Text component="a" href="/privacy" size="sm" td="underline" c="blue">Learn more</Text>
            </Text>
          </div>
          <Group gap="xs" wrap="nowrap" ml="auto">
            <Button size="sm" variant="default" onClick={handleDecline}>Decline</Button>
            <Button size="sm" onClick={handleAccept}>Accept</Button>
          </Group>
        </Group>
      </Paper>
    );
  }

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
