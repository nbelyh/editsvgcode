import { Button, Stack } from '@mantine/core';
import { IconBrandGoogle, IconBrandGithub, IconBrandWindows } from '@tabler/icons-react';
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft, logError } from '../lib/firebase';
import { trackSignIn } from '../lib/analytics';

interface SignInButtonsProps {
  onSuccess?: () => void;
  fullWidth?: boolean;
}

export function SignInButtons({ onSuccess, fullWidth }: SignInButtonsProps) {
  const handle = async (provider: 'google' | 'github' | 'microsoft', fn: () => Promise<unknown>) => {
    try {
      await fn();
      trackSignIn(provider);
      onSuccess?.();
    } catch (err) {
      logError(`signInWith${provider}`, err);
    }
  };

  return (
    <Stack gap="xs">
      <Button leftSection={<IconBrandGoogle size={16} />} variant="default" fullWidth={fullWidth} onClick={() => handle('google', signInWithGoogle)}>
        Sign in with Google
      </Button>
      <Button leftSection={<IconBrandGithub size={16} />} variant="default" fullWidth={fullWidth} onClick={() => handle('github', signInWithGithub)}>
        Sign in with GitHub
      </Button>
      <Button leftSection={<IconBrandWindows size={16} />} variant="default" fullWidth={fullWidth} onClick={() => handle('microsoft', signInWithMicrosoft)}>
        Sign in with Microsoft
      </Button>
    </Stack>
  );
}
