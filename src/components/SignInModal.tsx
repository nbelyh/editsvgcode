import { Button, Stack, Text } from '@mantine/core';
import { IconBrandGoogle, IconBrandGithub, IconBrandWindows } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft } from '../lib/firebase';
import { trackViewSignIn } from '../lib/analytics';

export function openSignInModal(message?: string, opts?: { onClose?: () => void }) {
  trackViewSignIn();
  modals.open({
    title: 'Sign in',
    centered: true,
    // Fires on dismissal only — picking a provider navigates away (redirect
    // sign-in) before any close event, so a caller's pending-action cleanup
    // runs exactly when the user abandons the sign-in.
    onClose: opts?.onClose,
    children: (
      <>
        <Text c="dimmed" size="sm" mb="md">{message ?? 'Sign in to save files, sync across devices, and unlock free monthly credits.'}</Text>
        <Stack gap="xs">
          <Button leftSection={<IconBrandGoogle size={16} />} variant="default" fullWidth onClick={signInWithGoogle}>Sign in with Google</Button>
          <Button leftSection={<IconBrandGithub size={16} />} variant="default" fullWidth onClick={signInWithGithub}>Sign in with GitHub</Button>
          <Button leftSection={<IconBrandWindows size={16} />} variant="default" fullWidth onClick={signInWithMicrosoft}>Sign in with Microsoft</Button>
        </Stack>
      </>
    ),
  });
}
