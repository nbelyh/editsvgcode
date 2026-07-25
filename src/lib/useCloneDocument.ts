import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { getAuth } from 'firebase/auth';
import { friendlyError } from './firebase';
import { cloneDocument } from './chat-history';
import { openSignInModal } from '../components/SignInModal';

/**
 * "Start from this" — fork somebody else's document into a draft of our own and
 * open it. Shared by the gallery cards and the read-only chat panel so both
 * offer the same gate, wording, and navigation.
 */
export function useCloneDocument() {
  const navigate = useNavigate();
  const [cloningId, setCloningId] = useState<string | null>(null);

  const clone = useCallback(async (id: string) => {
    // Cloning copies the chat too, which needs a real account (message writes
    // are denied for anonymous users) — same gate as the AI chat itself.
    const user = getAuth().currentUser;
    if (!user || user.isAnonymous) {
      openSignInModal();
      return;
    }
    setCloningId(id);
    try {
      const newId = await cloneDocument(id);
      if (newId) {
        notifications.show({ title: 'Copied', message: 'You now have your own draft of this file.', color: 'green' });
        navigate(`/${newId}`);
      }
    } catch (err) {
      notifications.show({ title: 'Copy failed', message: friendlyError(err), color: 'red' });
    } finally {
      setCloningId(null);
    }
  }, [navigate]);

  return { clone, cloningId };
}
