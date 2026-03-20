import { Stack, Title, Text, Anchor, Kbd } from '@mantine/core';
import { useEffect, useRef } from 'react';

interface SidebarProps {
  onOpenCommandPalette?: () => void;
}

export function Sidebar({ onOpenCommandPalette }: SidebarProps) {
  const adsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Carbon Ads script (skip on localhost)
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isLocal && adsRef.current && !adsRef.current.querySelector('#_carbonads_js')) {
      const script = document.createElement('script');
      script.id = '_carbonads_js';
      script.async = true;
      script.type = 'text/javascript';
      script.src = '//cdn.carbonads.com/carbon.js?serve=CWYICK37&placement=editsvgcodecom';
      adsRef.current.appendChild(script);
    }
  }, []);

  return (
    <Stack
      p="md"
      h="100%"
      style={{ backgroundColor: '#1e1e1e', color: '#aaa', overflow: 'auto' }}
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
      </div>
      <div ref={adsRef} />
    </Stack>
  );
}
