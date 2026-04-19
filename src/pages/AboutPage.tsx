import { Container, Title, Text, Stack, Anchor, List } from '@mantine/core';
import { IconBrandGithub, IconBrandTelegram, IconMail, IconBug, IconPhone } from '@tabler/icons-react';

export function AboutPage() {
  return (
    <div className="page-scroll">
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>About</Title>

        <Text>
          <strong>editsvgcode.com</strong> is a free online SVG code editor with live preview, built for designers and developers
          who work with SVG graphics. Write and edit SVG code with syntax highlighting and see changes rendered in real time.
        </Text>
        <Text>
          The Pro tier adds AI-powered features such as image-to-SVG conversion and natural-language editing,
          powered by large language models.
        </Text>

        <Title order={3}>Developer</Title>
        <Text>
          Built and maintained by Nikolay Belykh /{' '}
          <Anchor href="https://unmanagedvisio.com" target="_blank" rel="noopener noreferrer">UnmanagedVisio</Anchor>,
          Vienna, Austria.
        </Text>

        <Title order={3}>Contact & Support</Title>
        <Stack gap="xs">
          <Text>
            <IconMail size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
            Email: <Anchor href="mailto:support@unmanagedvisio.com">support@unmanagedvisio.com</Anchor>
          </Text>
          <Text>
            <IconPhone size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
            Phone: <Anchor href="tel:+4366473887141">+43 664 7388 7141</Anchor>
          </Text>
          <Text>
            <IconBug size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
            Bug reports: <Anchor href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</Anchor>
          </Text>
        </Stack>

        <Title order={3}>Social</Title>
        <Stack gap="xs">
          <Text>
            <IconBrandGithub size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
            <Anchor href="https://github.com/nbelyh/editsvgcode" target="_blank" rel="noopener noreferrer">GitHub</Anchor>
          </Text>
          <Text>
            <IconBrandTelegram size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
            <Anchor href="https://t.me/+lvkFDwkl7PBhMzdk" target="_blank" rel="noopener noreferrer">Telegram</Anchor>
          </Text>
        </Stack>

        <Title order={3}>Technology & Credits</Title>
        <Text>
          editsvgcode.com is built with React, Mantine, Monaco Editor, and Firebase.
          We gratefully acknowledge the following open-source projects and services:
        </Text>
        <List size="sm" spacing="xs">
          <List.Item>
            <Anchor href="https://github.com/visioncortex/vtracer" target="_blank" rel="noopener noreferrer">VTracer</Anchor>{' '}
            — bitmap-to-SVG vectorization engine (Rust / WebAssembly)
          </List.Item>
          <List.Item>
            <Anchor href="https://openai.com" target="_blank" rel="noopener noreferrer">OpenAI GPT</Anchor>{' '}
            — AI models powering chat, code editing, and image generation features
          </List.Item>
          <List.Item>
            <Anchor href="https://microsoft.github.io/monaco-editor/" target="_blank" rel="noopener noreferrer">Monaco Editor</Anchor>{' '}
            — code editor component (VS Code engine)
          </List.Item>
          <List.Item>
            <Anchor href="https://mantine.dev" target="_blank" rel="noopener noreferrer">Mantine</Anchor>{' '}
            — React UI component library
          </List.Item>
          <List.Item>
            <Anchor href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase</Anchor>{' '}
            — authentication, database, hosting, and analytics
          </List.Item>
          <List.Item>
            <Anchor href="https://github.com/nicedoc/dompurify" target="_blank" rel="noopener noreferrer">DOMPurify</Anchor>{' '}
            — SVG sanitization
          </List.Item>
          <List.Item>
            <Anchor href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer">Tabler Icons</Anchor>{' '}
            — icon set
          </List.Item>
        </List>
      </Stack>
    </Container>
    </div>
  );
}
