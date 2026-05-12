import { Container, Title, Text, Stack, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { SignInButtons } from '../components/SignInButtons';

export function SignInPage() {
  const navigate = useNavigate();

  return (
    <Container size="xs" py="xl" className="page-scroll">
      <Stack align="center" gap="lg">
        <Stack align="center" gap="xs">
          <Title order={2}>Sign in</Title>
          <Text c="dimmed" size="sm" ta="center">
            Sign in to save files, sync across devices, and unlock free monthly credits.
          </Text>
        </Stack>
        <Paper withBorder p="xl" radius="md" w="100%">
          <SignInButtons onSuccess={() => navigate('/')} fullWidth />
        </Paper>
      </Stack>
    </Container>
  );
}
