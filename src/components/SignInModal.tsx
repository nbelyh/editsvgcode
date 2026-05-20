import { Button, Stack, Text } from '@mantine/core';
import { IconBrandGoogle, IconBrandGithub, IconBrandWindows } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft } from '../lib/firebase';
import { trackViewSignIn } from '../lib/analytics';

export function openSignInModal() {
  trackViewSignIn();
  modals.open({
    title: 'Sign in',
    centered: true,
    children: (
      <>
        <Text c="dimmed" size="sm" mb="md">Sign in to save files, sync across devices, and unlock free monthly credits.</Text>
        <Stack gap="xs">
          <Button leftSection={<IconBrandGoogle size={16} />} variant="default" fullWidth onClick={signInWithGoogle}>Sign in with Google</Button>
          <Button leftSection={<IconBrandGithub size={16} />} variant="default" fullWidth onClick={signInWithGithub}>Sign in with GitHub</Button>
          <Button leftSection={<IconBrandWindows size={16} />} variant="default" fullWidth onClick={signInWithMicrosoft}>Sign in with Microsoft</Button>
        </Stack>
      </>
    ),
  });
}
