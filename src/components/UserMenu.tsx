import { useState, useEffect } from 'react';
import { Menu, ActionIcon, Avatar, Text, Group } from '@mantine/core';
import { IconLogin, IconLogout, IconUser } from '@tabler/icons-react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signOutUser } from '../lib/firebase';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  const isAnonymous = !user || user.isAnonymous;

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-out failed:', err);
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
              Profile &amp; Files
            </Menu.Item>
            <Menu.Item leftSection={<IconLogin size={14} />} onClick={handleSignIn}>
              Sign in with Google
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
              Profile &amp; Files
            </Menu.Item>
            <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleSignOut}>
              Sign out
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
