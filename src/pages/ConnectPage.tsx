import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Container, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { IconPlugConnected } from '@tabler/icons-react';
import { getAuth, onIdTokenChanged, type User } from 'firebase/auth';
import { PageMeta } from '../components/PageMeta';
import { openSignInModal } from '../components/SignInModal';
import { answerConnectRequest, loadConnectRequest, type ConnectRequest } from '../lib/mcp-connect';

/**
 * Where an MCP client — Claude, or another app — is given access to the user's drawings. The
 * authorization server sends the browser here mid-sign-in; Allow sends it back with a code.
 */
export function ConnectPage() {
  const [params] = useSearchParams();
  const requestId = params.get('request') ?? '';
  const [request, setRequest] = useState<ConnectRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => onIdTokenChanged(getAuth(), (u) => setUser(u)), []);

  useEffect(() => {
    if (!requestId) {
      setError('This link is missing its request. Start connecting again from the app.');
      return;
    }
    loadConnectRequest(requestId).then(setRequest, (err: Error) => setError(err.message));
  }, [requestId]);

  const signedIn = !!user && !user.isAnonymous;
  // Hosting already forbids framing this page; this covers a host that did not send the header.
  // Inside another site's frame, Allow could be clickjacked into granting that site access.
  const framed = window.top !== window.self;

  async function answer(approve: boolean) {
    setBusy(true);
    try {
      const idToken = approve && user ? await user.getIdToken() : undefined;
      window.location.assign(await answerConnectRequest(requestId, approve, idToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div className="page-scroll">
      <PageMeta title="Connect an app" noindex />
      <Container size="xs" py="xl">
        <Card withBorder padding="xl">
          <Stack gap="md">
            <Group gap="sm">
              <IconPlugConnected size={28} />
              <Title order={2}>Connect an app</Title>
            </Group>

            {framed && <Alert color="red">Open this page in its own window to connect an app.</Alert>}
            {!framed && error && <Alert color="red">{error}</Alert>}
            {!framed && !error && (!request || user === undefined) && <Loader />}

            {!framed && !error && request && user !== undefined && (
              <>
                <Text>
                  <b>{request.clientName}</b> wants to create, read and edit drawings in your editsvgcode account.
                </Text>
                <Text size="sm" c="dimmed">
                  Your answer goes back to <b>{request.redirectHost}</b>. Only allow it if you started connecting there.
                </Text>

                {signedIn ? (
                  <>
                    <Text size="sm">Signed in as <b>{user.email ?? user.displayName ?? 'you'}</b>.</Text>
                    <Group justify="flex-end">
                      <Button variant="default" disabled={busy} onClick={() => answer(false)}>Deny</Button>
                      <Button loading={busy} onClick={() => answer(true)}>Allow</Button>
                    </Group>
                  </>
                ) : (
                  <Group justify="flex-end">
                    <Button variant="default" disabled={busy} onClick={() => answer(false)}>Cancel</Button>
                    <Button onClick={() => openSignInModal('Sign in with your editsvgcode account to connect the app. It will work on your drawings.')}>
                      Sign in to continue
                    </Button>
                  </Group>
                )}
              </>
            )}
          </Stack>
        </Card>
      </Container>
    </div>
  );
}
