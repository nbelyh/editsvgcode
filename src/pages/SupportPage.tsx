import { Container, Title, Text, Stack, Anchor, Card, Group, ThemeIcon } from '@mantine/core';
import { IconMail, IconBrandTelegram, IconBrandGithub } from '@tabler/icons-react';

const channels = [
  {
    icon: IconMail,
    color: 'blue',
    title: 'Email',
    description: 'Send us an email and we will get back to you as soon as possible.',
    action: 'support@unmanagedvisio.com',
    href: 'mailto:support@unmanagedvisio.com',
  },
  {
    icon: IconBrandTelegram,
    color: 'blue',
    title: 'Telegram Chat',
    description: 'Ask a question in our Telegram chat for a quick response.',
    action: 'Join Telegram Chat',
    href: 'https://t.me/+w7LQ2F2ckmViYjU0',
  },
  {
    icon: IconBrandGithub,
    color: 'gray',
    title: 'Bug Reports',
    description: 'Found a bug? Report it on GitHub Issues.',
    action: 'Open GitHub Issues',
    href: 'https://github.com/nbelyh/editsvgcode/issues',
  },
];

export function SupportPage() {
  return (
    <div className="page-scroll">
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Support</Title>
        <Text>
          We try to process every support request as fast as possible, though it may take up to a few days.
          Registered Pro users are processed on priority — please include your order number in the subject line if applicable.
        </Text>

        <Stack gap="md">
          {channels.map((ch) => (
            <Card key={ch.title} withBorder padding="lg">
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon size={40} radius="md" color={ch.color} variant="light">
                  <ch.icon size={22} />
                </ThemeIcon>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600}>{ch.title}</Text>
                  <Text size="sm" c="dimmed">{ch.description}</Text>
                  <Anchor href={ch.href} target="_blank" rel="noopener noreferrer" size="sm">
                    {ch.action}
                  </Anchor>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
    </div>
  );
}
