import { Stack, Title, Text } from '@mantine/core';
import { useEffect, useRef } from 'react';

export function Sidebar() {
  const adsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Carbon Ads script
    if (adsRef.current && !adsRef.current.querySelector('#_carbonads_js')) {
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
      style={{ backgroundColor: '#1e1e1e', color: '#999', overflow: 'auto' }}
    >
      <div>
        <Title order={4} c="dimmed">SVG Code Sandbox</Title>
        <Text size="sm" c="dimmed" mt="xs">Upload or paste SVG code for editing.</Text>
        <Text size="sm" c="dimmed" mt="xs">Autocomplete assists with tags and attributes, with real-time preview.</Text>
        <Text size="sm" c="dimmed" mt="xs">Save your work by copying, downloading, or sharing via a public link.</Text>
      </div>
      <div ref={adsRef} />
    </Stack>
  );
}
