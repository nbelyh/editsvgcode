import { Stack, Title, Text, Anchor, Kbd } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { subscribeCredits } from '../lib/credits-listener';

interface SidebarProps {
  onOpenCommandPalette?: () => void;
  onOpenAiChat?: () => void;
}

export function Sidebar({ onOpenCommandPalette, onOpenAiChat }: SidebarProps) {
  const adsRef = useRef<HTMLDivElement>(null);
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    return subscribeCredits((credits) => {
      setShowAds(credits.tier !== 'pro');
    });
  }, []);

  useEffect(() => {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isLocal && showAds && adsRef.current && !adsRef.current.querySelector('#_carbonads_js')) {
      const script = document.createElement('script');
      script.id = '_carbonads_js';
      script.async = true;
      script.type = 'text/javascript';
      script.src = '//cdn.carbonads.com/carbon.js?serve=CWYICK37&placement=editsvgcodecom';
      adsRef.current.appendChild(script);
    }
  }, [showAds]);

  return (
    <Stack
      p="md"
      h="100%"
      style={{ backgroundColor: 'var(--esvg-chrome-bg)', overflow: 'auto' }}
    >
      <div>
        <Title order={4}>SVG Code Sandbox</Title>
        <Text size="sm" mt="xs">Upload or paste SVG code for editing.</Text>
        <Text size="sm" mt="xs">Autocomplete assists with tags and attributes, with real-time preview.</Text>
        <Text size="sm" mt="xs">Save your work by copying, downloading, or sharing via a public link.</Text>
        <Text size="sm" mt="xs">
          Press <Kbd>F1</Kbd> to open the{' '}
          <Anchor component="button" size="sm" onClick={onOpenCommandPalette}>Command Palette</Anchor>
          {' '}for additional editor actions.
        </Text>
        <Text size="sm" mt="xs">
          Use{' '}
          <Anchor component="button" size="sm" onClick={onOpenAiChat}>AI Chat</Anchor>
          {' '}to edit your SVG with natural language. Describe what you want to change and the AI will propose edits you can accept or reject.
        </Text>
      </div>
      <div style={{ flex: 1 }} />
      <div ref={adsRef} />
    </Stack>
  );
}
