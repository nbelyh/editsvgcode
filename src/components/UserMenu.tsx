import { useState, useEffect } from 'react';
import { Menu, ActionIcon, Avatar, Text, Group } from '@mantine/core';
import { IconBrandGithub, IconBrandGoogle, IconLogout, IconUser, IconCreditCard, IconFiles, IconStar, IconMessageReport } from '@tabler/icons-react';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithGithub, signOutUser, logError } from '../lib/firebase';
import { trackSignIn } from '../lib/analytics';
import { subscribeCredits } from '../lib/credits-listener';
import type { Credits } from '../lib/api-client';

interface UserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

function snapshotUser(u: import('firebase/auth').User | null): UserInfo | null {
  if (!u) return null;
  return { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL, isAnonymous: u.isAnonymous };
}

export function UserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    return onIdTokenChanged(auth, (u) => setUser(snapshotUser(u)));
  }, []);

  useEffect(() => {
    return subscribeCredits(setCredits);
  }, []);

  const isAnonymous = !user || user.isAnonymous;
  const isPro = credits?.tier === 'pro';

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      trackSignIn('google');
    } catch (err) {
      logError('signInWithGoogle', err);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      trackSignIn('github');
    } catch (err) {
      logError('signInWithGithub', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      logError('signOut', err);
    }
  };

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
          {isAnonymous ? (
            <IconUser size={20} />
          ) : (
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName ?? ''}
              size={28}
              radius="xl"
            />
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {isAnonymous ? (
          <>
            <Menu.Label>
              <div style={{ overflow: 'hidden' }}>
                <Text size="xs" c="dimmed">Anonymous</Text>
                <Text size="xs" c="dimmed" truncate style={{ fontFamily: 'monospace' }}>{user?.uid}</Text>
              </div>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconFiles size={14} />} onClick={() => navigate('/files')}>
              Files
            </Menu.Item>
            <Menu.Item leftSection={<IconCreditCard size={14} />} onClick={() => navigate('/pricing')}>
              Upgrade to Pro
            </Menu.Item>
            <Menu.Item leftSection={<IconBrandGoogle size={14} />} onClick={handleGoogleSignIn}>
              Sign in with Google
            </Menu.Item>
            <Menu.Item leftSection={<IconBrandGithub size={14} />} onClick={handleGithubSignIn}>
              Sign in with GitHub
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconMessageReport size={14} />} component="a" href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer">
              Feedback / Report Issue
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Label>
              <Group gap="xs">
                <Avatar src={user?.photoURL} size={24} radius="xl" />
                <div style={{ overflow: 'hidden' }}>
                  <Text size="sm" fw={500} truncate>{user?.displayName}</Text>
                  <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
                </div>
              </Group>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconFiles size={14} />} onClick={() => navigate('/files')}>
              Files
            </Menu.Item>

            {!isPro && (
              <Menu.Item leftSection={<IconStar size={14} />} onClick={() => navigate('/pricing')}>
                Upgrade to Pro
              </Menu.Item>
            )}
            <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleSignOut}>
              Sign out
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconMessageReport size={14} />} component="a" href="https://github.com/nbelyh/editsvgcode/issues" target="_blank" rel="noopener noreferrer">
              Feedback / Report Issue
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
