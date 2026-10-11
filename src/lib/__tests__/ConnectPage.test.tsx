import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { ConnectPage } from '../../pages/ConnectPage';

let currentUser: unknown = null;
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  onIdTokenChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    cb(currentUser);
    return () => {};
  },
}));

const openSignInModal = vi.fn();
vi.mock('../../components/SignInModal', () => ({ openSignInModal: (...args: unknown[]) => openSignInModal(...args) }));

function renderPage(search = '?request=req1') {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={[`/connect${search}`]}>
        <ConnectPage />
      </MemoryRouter>
    </MantineProvider>,
  );
}

const fetchMock = vi.fn();
const assign = vi.fn();

beforeEach(() => {
  currentUser = null;
  fetchMock.mockReset();
  assign.mockReset();
  openSignInModal.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('location', { ...window.location, assign });
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    if (url.startsWith('/oauth/request')) {
      return new Response(JSON.stringify({ clientName: 'Claude', redirectHost: 'claude.ai' }), { status: 200 });
    }
    if (url === '/oauth/approve') {
      const body = JSON.parse(String(init?.body));
      const redirect = body.approve
        ? 'https://claude.ai/api/mcp/auth_callback?code=c&state=s'
        : 'https://claude.ai/api/mcp/auth_callback?error=access_denied';
      return new Response(JSON.stringify({ redirect }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ConnectPage', () => {
  it('says who is asking and where the answer goes', async () => {
    renderPage();
    expect(await screen.findByText('Claude')).toBeTruthy();
    expect(screen.getByText('claude.ai')).toBeTruthy();
  });

  it('asks a visitor who is not signed in to sign in first', async () => {
    renderPage();
    fireEvent.click(await screen.findByText('Sign in to continue'));
    expect(openSignInModal).toHaveBeenCalled();
    expect(screen.queryByText('Allow')).toBeNull();
  });

  it('treats an anonymous session as not signed in', async () => {
    currentUser = { isAnonymous: true, getIdToken: async () => 'anon' };
    renderPage();
    expect(await screen.findByText('Sign in to continue')).toBeTruthy();
  });

  it('approves with the ID token and sends the browser back with the code', async () => {
    currentUser = { isAnonymous: false, email: 'me@example.com', getIdToken: async () => 'id-token' };
    renderPage();
    fireEvent.click(await screen.findByText('Allow'));
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://claude.ai/api/mcp/auth_callback?code=c&state=s'));
    const [, init] = fetchMock.mock.calls.find(([url]) => url === '/oauth/approve')!;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer id-token');
    expect(JSON.parse(init.body)).toEqual({ request: 'req1', approve: true });
  });

  it('declines without sending a token', async () => {
    currentUser = { isAnonymous: false, email: 'me@example.com', getIdToken: async () => 'id-token' };
    renderPage();
    fireEvent.click(await screen.findByText('Deny'));
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://claude.ai/api/mcp/auth_callback?error=access_denied'));
    const [, init] = fetchMock.mock.calls.find(([url]) => url === '/oauth/approve')!;
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('explains an expired or missing request', async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ error: 'This request has expired.' }), { status: 404 }));
    renderPage();
    expect(await screen.findByText('This request has expired.')).toBeTruthy();
    renderPage('');
    expect(await screen.findByText(/missing its request/)).toBeTruthy();
  });
});
