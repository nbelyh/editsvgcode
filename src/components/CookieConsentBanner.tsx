import { useState } from 'react';
import { Group, Text, Button, Paper } from '@mantine/core';
import { hasResponded, setConsent } from '../lib/cookie-consent';
import { enableAnalytics } from '../lib/firebase';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(!hasResponded());

  if (!visible) return null;

  const handleAccept = () => {
    setConsent('accepted');
    enableAnalytics();
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent('declined');
    setVisible(false);
  };

  return (
    <Paper
      shadow="md"
      p="sm"
      withBorder
      style={{
        position: 'fixed',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        // Below Mantine's modal layer (200). At 1000 this sat on top of every
        // dialog and, being fixed to the bottom, silently swallowed clicks on
        // the footer buttons of any dialog tall enough to reach it.
        zIndex: 190,
        maxWidth: 520,
        width: 'calc(100% - 32px)',
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Text size="sm">
          This website uses cookies for analytics.{' '}
          <Text component="a" href="/privacy" size="sm" td="underline" c="blue">Learn more</Text>
        </Text>
        <Group gap="xs" wrap="nowrap">
          <Button size="xs" variant="default" onClick={handleDecline}>Decline</Button>
          <Button size="xs" onClick={handleAccept}>Accept</Button>
        </Group>
      </Group>
    </Paper>
  );
}
