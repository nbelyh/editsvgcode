import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { notifications } from '@mantine/notifications';
import { ActionIcon, Tooltip, Text, Button } from '@mantine/core';
import { IconEraser, IconGitFork } from '@tabler/icons-react';
import { sendChatRequest, isCreditsError, type ProgressStatus, type Credits, type IconResult, type ReadToolCall } from '../../lib/api-client';
import { subscribeCredits } from '../../lib/credits-listener';
import { loadChatMessages, scheduleSaveChatMessages, clearChatMessages, getChatAccess, migrateLegacyChat } from '../../lib/chat-history';
import { friendlyError } from '../../lib/firebase';
import { DEFAULT_PRICING } from '../../lib/pricing';
import { EDIT_MODELS, resolveEditModel, resolveImageModel, type ReasoningEffort } from '../../lib/models';
import { ChatThread } from './ChatThread';
import { ChatComposer } from './ChatComposer';
import { openSignInModal } from '../SignInModal';
import { useCloneDocument } from '../../lib/useCloneDocument';
import type { DisplayMessage, AiChatProps } from './types';
import { trackAiChat, trackAiAccept, trackAiReject, trackAiThumbsUp, trackAiThumbsDown, trackCreditsExhausted, trackImageGen } from '../../lib/analytics';
import '../AiChat.css';

const HISTORY_KEY = 'esvg-input-history';
const MAX_HISTORY = 100;

// Draft stashed when a guest hits send: sign-in is a full-page redirect (popup
// auth breaks under some browser extensions/VPNs), so React state does not
// survive it. sessionStorage does — Firebase's own redirect flow depends on it.
const PENDING_SEND_KEY = 'esvg-pending-send';

/**
 * Heuristic: detect prompts that primarily request raster image generation.
 * Reasoning effort doesn't help much here — the model's job is to call
 * generate_image. Using lower effort cuts latency significantly.
 *
 * Conservative match — only clearly-generative phrases. Icon/logo prompts are
 * deliberately excluded because the model still needs to decide between
 * search_icons and generate_image, which benefits from higher reasoning.
 */
function looksLikeImageGen(text: string): boolean {
  const t = text.toLowerCase();
  const keywords = [
    'draw ', 'draw me ', 'draw a ', 'draw an ',
    'generate an image', 'generate image', 'generate a picture',
    'create an image', 'create a picture',
    'make me an image', 'make a picture',
    'picture of ', 'photo of ', 'image of ', 'illustration of ',
    'render ', 'paint ', 'sketch ',
  ];
  return keywords.some(k => t.includes(k));
}

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

export function AiChat({ svgCode, fileId, documentReady, selectedElement, selectedLineRange, onPreviewSvg, onAcceptSvg, onRestore, onChatLoaded }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('thinking');
  const [credits, setCredits] = useState<Credits | null>(null);
  const [model, setModel] = useState(() => resolveEditModel(localStorage.getItem('esvg-model')));
  const [imageModel, setImageModel] = useState(() => resolveImageModel(localStorage.getItem('esvg-image-model')));
  const [effortByModel, setEffortByModel] = useState<Record<string, ReasoningEffort>>(() => {
    try { return JSON.parse(localStorage.getItem('esvg-effort-by-model') || '{}'); } catch { return {}; }
  });
  const currentModelDef = useMemo(() => EDIT_MODELS.find(m => m.value === model), [model]);
  const supportedEfforts = currentModelDef?.efforts;
  const effort: ReasoningEffort | undefined = supportedEfforts ? (effortByModel[model] ?? currentModelDef?.defaultEffort ?? 'high') : undefined;
  const setEffort = useCallback((v: ReasoningEffort) => {
    setEffortByModel(prev => {
      const next = { ...prev, [model]: v };
      localStorage.setItem('esvg-effort-by-model', JSON.stringify(next));
      return next;
    });
  }, [model]);
  const tier = credits?.tier ?? 'free';
  // null = auth not yet known (Firebase still restoring the session after page
  // load). Distinct from anonymous: a signed-in user must not be treated as a
  // guest during the restore window, so auth-gated paths wait for a real value.
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(() => {
    const user = getAuth().currentUser;
    return user ? user.isAnonymous : null;
  });
  useEffect(() => {
    return onAuthStateChanged(getAuth(), (user) => setIsAnonymous(user ? user.isAnonymous : null));
  }, []);
  const isDebug = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isModelDisabled = useCallback((m: { pro: boolean }) => !isDebug && tier !== 'pro' && m.pro, [isDebug, tier]);
  const hasPending = messages.some(m => m.toolCalls?.some(tc => tc.status === 'pending'));
  // Undo targets live in the messages themselves (accepted calls carry prevSvg)
  const canUndo = messages.some(m => m.toolCalls?.some(tc => tc.status === 'accepted' && tc.prevSvg));
  const [iconPickIcons, setIconPickIcons] = useState<IconResult[] | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<IconResult | null>(null);
  const [imageConfirmSummary, setImageConfirmSummary] = useState<string | null>(null);
  const [inputHistory, setInputHistory] = useState<string[]>(loadHistory);
  const iconPickResolveRef = useRef<((result: IconResult | 'more' | 'none') => void) | null>(null);
  const imageConfirmResolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  // Write access to this document's chat, resolved on load. `isViewer` means
  // somebody else's document: the chat shows read-only with a fork offer, and
  // is distinct from a guest on their own draft (who may type and is funnelled
  // into sign-in on send).
  const [canWrite, setCanWrite] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const { clone, cloningId } = useCloneDocument();

  const viewportRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  // Arms the deferred-send effect below (see its comment): set alongside
  // setInput by edit-resubmit and the post-sign-in draft restore.
  const pendingSendRef = useRef(false);

  // Subscribe to real-time credit balance from Firestore
  useEffect(() => {
    return subscribeCredits(setCredits);
  }, []);

  // Load messages from the server on mount and when fileId changes. Wait for
  // Firebase to RESTORE auth first: loading before the user is known returns
  // empty, and the subsequent debounced save would then wipe the stored chat.
  // Guests load too — a public/unlisted document's chat is readable by anyone
  // with the link, and that shared conversation is the point of the gallery.
  // The load doesn't latch per session kind: when a stale session forces the
  // app to boot as anonymous and the user then signs back in, it re-runs for
  // the real account (safe — the guest view is read-only, so there is no
  // in-memory chat to overwrite; a guest's draft lives in the composer input,
  // which the load doesn't touch).
  useEffect(() => {
    loadedRef.current = false;
    setMessages([]);
    setCanWrite(false);
    setIsViewer(false);
    onPreviewSvg(null);
    let cancelled = false;
    let loadedFor: string | null = null;
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      if (cancelled || !user) return;
      const sessionKey = user.isAnonymous ? 'anonymous' : user.uid;
      if (sessionKey === loadedFor) return;
      loadedFor = sessionKey;
      const isGuest = user.isAnonymous;
      Promise.all([
        loadChatMessages(fileId).then(
          (messages) => ({ ok: true as const, messages }),
          (err: unknown) => ({ ok: false as const, err }),
        ),
        getChatAccess(fileId),
      ]).then(async ([result, access]) => {
        if (cancelled) return;
        if (!result.ok) {
          // A failed read must never present as an empty chat. Stay read-only
          // with loadedRef false: the debounced save reconciles the
          // subcollection against what it is given, so writing now would delete
          // the very conversation we could not read.
          // 'permission-denied' is the ordinary "not our document" case, which
          // the page already reports — a second red toast there is just noise.
          if ((result.err as { code?: string })?.code !== 'permission-denied') {
            notifications.show({
              title: 'Failed to load chat',
              message: friendlyError(result.err),
              color: 'red',
            });
          }
          setCanWrite(false);
          setIsViewer(access.isViewer);
          return;
        }
        const loaded = result.messages;
        // A pre-server-chat conversation may still sit in this browser's
        // IndexedDB — lift it to the server on first open so upgrading users
        // don't find a familiar document's chat empty. Only when the server has
        // nothing, so a stale local copy can never clobber a real chat.
        const stored = loaded.length === 0 && access.canWrite
          ? (await migrateLegacyChat(fileId)) ?? loaded
          : loaded;
        if (cancelled) return;
        setMessages(stored);
        setCanWrite(access.canWrite);
        setIsViewer(access.isViewer);
        onChatLoaded?.(stored.length > 0);
        loadedRef.current = true;
        if (isGuest) return; // no pending send to restore — guests can't send
        // A guest's send was interrupted by the sign-in redirect — restore the
        // draft and re-send it. Only after the load: sending earlier would let
        // the load clobber the in-flight message. The stash is consumed only by
        // its own file (a different file's load must leave it intact) and only
        // into an empty composer (never clobber text typed while loading).
        try {
          const raw = sessionStorage.getItem(PENDING_SEND_KEY);
          if (raw) {
            const pending = JSON.parse(raw) as { fileId?: string; text?: string };
            if (pending.fileId === fileId) {
              sessionStorage.removeItem(PENDING_SEND_KEY);
              if (pending.text && !inputRef.current.trim()) {
                setInput(pending.text);
                pendingSendRef.current = true;
              }
            }
          }
        } catch { sessionStorage.removeItem(PENDING_SEND_KEY); /* corrupted stash */ }
      });
    });
    return () => { cancelled = true; unsub(); };
  }, [fileId, onChatLoaded]);

  // Persist messages on change — debounced write to the server. Skip empty:
  // merely opening a document must not create a server doc (only a real first
  // message does); truncation-to-empty is handled explicitly by its handler.
  // The current SVG rides along (via ref — editor keystrokes must not retrigger
  // a full message rewrite) so the created draft doc carries its document.
  const svgRef = useRef(svgCode);
  svgRef.current = svgCode;
  // Mirror of `input` for the load callback above (its closure is per-fileId
  // and would otherwise see the mount-time value).
  const inputRef = useRef(input);
  inputRef.current = input;
  useEffect(() => {
    if (loadedRef.current && canWrite && messages.length > 0) {
      scheduleSaveChatMessages(fileId, messages, svgRef.current);
    }
  }, [messages, fileId, canWrite]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRunning]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    // hasPending guards programmatic callers (deferred sends) — interactive
    // paths are already blocked by the composer's disabled state.
    if (!text || isRunning || hasPending) return;

    // AI requires a real account — guests get the sign-in modal instead of an
    // AI call (the server enforces this too; this is just the friendly path).
    // Stash the draft first: sign-in redirects away, and the restore path in
    // the load effect re-sends it once the user is back and signed in. The
    // stash is cleared if the user dismisses the modal — an abandoned send
    // must never fire off a later, unrelated sign-in.
    // isAnonymous === null means auth is still restoring: drop the send rather
    // than mistake a signed-in user for a guest.
    if (isAnonymous !== false) {
      if (isAnonymous) {
        try { sessionStorage.setItem(PENDING_SEND_KEY, JSON.stringify({ fileId, text })); } catch { /* storage unavailable — modal still opens */ }
        openSignInModal(
          `AI needs a free account. Your message is kept and will be sent automatically after you sign in — ${DEFAULT_PRICING.freeMonthlyCredits} AI credits included every month.`,
          { onClose: () => sessionStorage.removeItem(PENDING_SEND_KEY) },
        );
      }
      return;
    }

    const userMsg: DisplayMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsRunning(true);
    setProgressStatus('thinking');

    // Push to global input history
    setInputHistory(prev => {
      const next = [text, ...prev.filter(h => h !== text)].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const conversationHistory: unknown[] = [];
      for (const m of messages) {
        if (m.rawItems) {
          conversationHistory.push(...m.rawItems);
        }
      }

      const handleIconPick = (icons: IconResult[]): Promise<IconResult | 'more' | 'none'> => {
        return new Promise<IconResult | 'more' | 'none'>(resolve => {
          setIconPickIcons(icons);
          setSelectedIcon(null);
          iconPickResolveRef.current = (result) => {
            if (result !== 'none' && typeof result === 'object') {
              setSelectedIcon(result);
            }
            iconPickResolveRef.current = null;
            resolve(result);
          };
        });
      };

      const handleImageConfirm = (summary: string, isModify: boolean): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
          setImageConfirmSummary(isModify ? `modify:${summary}` : summary);
          imageConfirmResolveRef.current = (confirmed) => {
            setImageConfirmSummary(null);
            imageConfirmResolveRef.current = null;
            resolve(confirmed);
          };
        });
      };

      const collectedToolCalls: ReadToolCall[] = [];

      // Find the last generated PNG from previous messages (for modify_image)
      let lastPngDataUrl: string | undefined;
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m.toolCalls) {
          for (let j = m.toolCalls.length - 1; j >= 0; j--) {
            const tc = m.toolCalls[j];
            if ((tc.name === 'generate_image' || tc.name === 'modify_image') && tc.status === 'accepted' && tc.arguments.pngDataUrl) {
              lastPngDataUrl = tc.arguments.pngDataUrl as string;
              break;
            }
          }
          if (lastPngDataUrl) break;
        }
      }

      const response = await sendChatRequest(
        conversationHistory,
        text,
        svgCode,
        selectedElement,
        selectedLineRange,
        model,
        imageModel,
        abort.signal,
        setProgressStatus,
        // Lower effort for image-generation prompts — reasoning doesn't help much there
        supportedEfforts && looksLikeImageGen(text) ? 'low' : effort,
        handleIconPick,
        (tc) => collectedToolCalls.push(tc),
        handleImageConfirm,
        lastPngDataUrl,
      );

      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls?.map(tc => ({
          ...tc,
          status: tc.arguments.svg ? 'pending' as const : 'accepted' as const,
        })),
        rawItems: [
          { role: 'user', content: text },
          ...response.rawOutput,
        ],
        selectedIcon: selectedIcon ?? undefined,
        readToolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);

      trackAiChat(model);
      if (response.toolCalls?.some(tc => tc.name === 'generate_image' || tc.name === 'modify_image')) {
        trackImageGen(imageModel);
      }
      const firstSvg = response.toolCalls?.find(tc => tc.arguments.svg)?.arguments.svg as string | undefined;
      if (firstSvg) onPreviewSvg(firstSvg);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const creditsErr = isCreditsError(err);
      if (creditsErr) trackCreditsExhausted();
      const errMsg = (err as Error).message;
      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: creditsErr ? errMsg : `Error: ${errMsg}`,
        buyCredits: creditsErr || undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsRunning(false);
      abortRef.current = null;
      setIconPickIcons(null);
      setSelectedIcon(null);
      setImageConfirmSummary(null);
      imageConfirmResolveRef.current = null;
    }
  }, [input, isRunning, hasPending, isAnonymous, fileId, messages, svgCode, selectedElement, selectedLineRange, model, imageModel, effort]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    // Settle pending in-chat prompts — sendChatRequest awaits their promises,
    // which the abort signal can't interrupt; the resolved continuation then
    // hits the aborted fetch and unwinds with AbortError.
    iconPickResolveRef.current?.('none');
    imageConfirmResolveRef.current?.(false);
    setIsRunning(false);
    setIconPickIcons(null);
    setSelectedIcon(null);
    setImageConfirmSummary(null);
    iconPickResolveRef.current = null;
    imageConfirmResolveRef.current = null;
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setIconPickIcons(null);
    setSelectedIcon(null);
    onPreviewSvg(null);
    clearChatMessages(fileId);
  }, [onPreviewSvg, fileId]);

  // The earliest accepted call in the removed range holds the document state
  // to roll back to (its prevSvg predates every removed accept).
  const restoreTarget = useCallback((removed: DisplayMessage[]): string | undefined =>
    removed.flatMap(m => m.toolCalls ?? [])
      .find(tc => tc.status === 'accepted' && tc.arguments.svg)?.prevSvg,
  []);

  const handleRestore = useCallback((msgIdx: number) => {
    const target = restoreTarget(messages.slice(msgIdx));

    const userMsg = messages[msgIdx];
    if (userMsg?.role === 'user' && userMsg.content) {
      setInput(userMsg.content);
    }

    const kept = messages.slice(0, msgIdx);
    setMessages(kept);
    scheduleSaveChatMessages(fileId, kept);

    onPreviewSvg(null);
    if (target) onRestore(target);
  }, [messages, onPreviewSvg, onRestore, fileId, restoreTarget]);

  // --- Edit previous message ---
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleEditStart = useCallback((msgIdx: number) => {
    const msg = messages[msgIdx];
    if (msg?.role === 'user') {
      setEditingIndex(msgIdx);
      setEditingText(msg.content);
    }
  }, [messages]);

  const handleEditCancel = useCallback(() => {
    setEditingIndex(null);
    setEditingText('');
  }, []);

  const handleEditSubmit = useCallback((msgIdx: number, newText: string) => {
    const text = newText.trim();
    if (!text || isRunning) return;

    // Restore to checkpoint (drop this message and everything after)
    const target = restoreTarget(messages.slice(msgIdx));

    const kept = messages.slice(0, msgIdx);
    setMessages(kept);
    scheduleSaveChatMessages(fileId, kept);
    onPreviewSvg(null);
    if (target) onRestore(target);

    // Clear editing state and set input to the edited text, then trigger send
    setEditingIndex(null);
    setEditingText('');
    setInput(text);
    // We need to trigger send after state updates, so use a ref flag
    pendingSendRef.current = true;
  }, [isRunning, messages, fileId, onPreviewSvg, onRestore, restoreTarget]);

  // Deferred send: fires handleSend once after setInput lands. Used by
  // edit-resubmit and by the post-sign-in draft restore. Holds until the
  // document has loaded — a send must never carry useDocument's initial
  // placeholder instead of the user's SVG. handleSend's own guards (isRunning,
  // hasPending, auth) still apply; if one rejects, the draft stays in the
  // composer for a manual send.
  useEffect(() => {
    if (pendingSendRef.current && documentReady && input.trim() && !isRunning) {
      pendingSendRef.current = false;
      handleSend();
    }
  }, [input, isRunning, documentReady, handleSend]);

  const handleAccept = useCallback((msgIndex: number, tcIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg?.toolCalls?.[tcIndex]) return;

    const tc = msg.toolCalls[tcIndex];
    const svg = tc.arguments.svg as string;
    // Snapshot the pre-accept document as the undo target BEFORE applying.
    const prevSvg = svgRef.current;
    if (svg) onAcceptSvg(svg);
    trackAiAccept();
    onPreviewSvg(null);

    setMessages(prev => prev.map((m, i) =>
      i !== msgIndex ? m : {
        ...m,
        toolCalls: m.toolCalls?.map((t, j) =>
          j === tcIndex ? { ...t, status: 'accepted' as const, prevSvg } : t
        ),
      }
    ));
  }, [messages, onAcceptSvg, onPreviewSvg]);

  const handleUpdateToolCallSvg = useCallback((msgIndex: number, tcIndex: number, newSvg: string) => {
    setMessages(prev => prev.map((m, i) =>
      i !== msgIndex ? m : {
        ...m,
        toolCalls: m.toolCalls?.map((t, j) =>
          j !== tcIndex ? t : { ...t, arguments: { ...t.arguments, svg: newSvg } }
        ),
      }
    ));
    onPreviewSvg(newSvg);
  }, [onPreviewSvg]);

  const handleUndoAccept = useCallback((msgIndex: number, tcIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg?.toolCalls?.[tcIndex]) return;

    const tc = msg.toolCalls[tcIndex];
    const svg = tc.arguments.svg as string;

    // Roll the document back to this call's pre-accept snapshot
    if (tc.prevSvg) onRestore(tc.prevSvg);

    // Set tool call back to pending so vectorizer controls appear
    setMessages(prev => prev.map((m, i) =>
      i !== msgIndex ? m : {
        ...m,
        toolCalls: m.toolCalls?.map((t, j) =>
          j === tcIndex ? { ...t, status: 'pending' as const } : t
        ),
      }
    ));

    // Preview the tool call's SVG
    if (svg) onPreviewSvg(svg);
  }, [messages, onPreviewSvg, onRestore]);

  const handleReject = useCallback((msgIndex: number, tcIndex: number) => {
    const tc = messages[msgIndex]?.toolCalls?.[tcIndex];
    const userMsg = messages[msgIndex - 1];
    const promptLen = userMsg?.role === 'user' ? userMsg.content.length : 0;

    trackAiReject({ model, effort: effort, tool: tc?.name ?? '', prompt_len: promptLen });

    onPreviewSvg(null);

    const userMsgIndex = msgIndex - 1;
    const restoredText = userMsg?.role === 'user' ? userMsg.content : '';

    setMessages(prev => prev.filter((_, i) => i !== userMsgIndex && i !== msgIndex));
    setInput(restoredText);
  }, [messages, onPreviewSvg, model, effort]);

  const handleThumbsUp = useCallback((msgIndex: number) => {
    const userMsg = messages[msgIndex - 1];
    const promptLen = userMsg?.role === 'user' ? userMsg.content.length : 0;
    trackAiThumbsUp({ model, effort, prompt_len: promptLen });
  }, [messages, model, effort]);

  const handleThumbsDown = useCallback((msgIndex: number, prompt: string) => {
    const userMsg = messages[msgIndex - 1];
    const promptLen = userMsg?.role === 'user' ? userMsg.content.length : 0;
    trackAiThumbsDown({ model, effort, prompt_len: promptLen, shared: !!prompt });
  }, [messages, model, effort]);

  const handleModelChange = useCallback((v: string) => {
    setModel(v);
    localStorage.setItem('esvg-model', v);
  }, []);

  const handleImageModelChange = useCallback((v: string) => {
    setImageModel(v);
    localStorage.setItem('esvg-image-model', v);
  }, []);

  const handleIconSelect = useCallback((icon: IconResult) => {
    iconPickResolveRef.current?.(icon);
  }, []);

  const handleIconMore = useCallback(() => {
    iconPickResolveRef.current?.('more');
  }, []);

  const handleIconNone = useCallback(() => {
    iconPickResolveRef.current?.('none');
    setIconPickIcons(null);
    setSelectedIcon(null);
  }, []);

  const handleImageConfirmYes = useCallback(() => {
    imageConfirmResolveRef.current?.(true);
  }, []);

  const handleImageConfirmNo = useCallback(() => {
    imageConfirmResolveRef.current?.(false);
  }, []);

  return (
    <div className="aui-root">
      <div className="aui-header">
        {/* Titled to match the Info tab's header, so switching tabs keeps the
            same bar rather than swapping a labelled one for a bare one. */}
        <Text size="xs" fw={600} c="dimmed" mr="auto">AI Chat</Text>
        {isViewer && <Text size="xs" c="dimmed">Read-only — shared by the author</Text>}
        <Tooltip label="Clear Chat">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleNewChat} disabled={isRunning || hasPending || messages.length === 0 || isViewer}>
            <IconEraser size={16} />
          </ActionIcon>
        </Tooltip>
      </div>
      <div className="aui-thread">
        <ChatThread
          messages={messages}
          isRunning={isRunning}
          progressStatus={progressStatus}
          canUndo={canUndo}
          isAnonymous={isAnonymous === true}
          isViewer={isViewer}
          viewportRef={viewportRef}
          endRef={endRef}
          onAccept={handleAccept}
          onReject={handleReject}
          onUpdateToolCallSvg={handleUpdateToolCallSvg}
          onUndoAccept={handleUndoAccept}
          onRestore={handleRestore}
          onThumbsUp={handleThumbsUp}
          onThumbsDown={handleThumbsDown}
          editingIndex={editingIndex}
          editingText={editingText}
          onEditStart={handleEditStart}
          onEditChange={setEditingText}
          onEditSubmit={handleEditSubmit}
          onEditCancel={handleEditCancel}
          iconPickIcons={iconPickIcons}
          iconPickSelected={selectedIcon}
          onIconSelect={handleIconSelect}
          onIconMore={handleIconMore}
          onIconNone={handleIconNone}
          imageConfirmSummary={imageConfirmSummary}
          onImageConfirm={handleImageConfirmYes}
          onImageDecline={handleImageConfirmNo}
          onSamplePrompt={setInput}
        />
        {isViewer ? (
          // Somebody else's document: the conversation is readable but not
          // continuable. Forking gives the visitor a draft of their own —
          // chat, document and all — which they can carry on from.
          <div className="aui-viewer-bar">
            <Text size="xs" c="dimmed">
              This is someone else's document. Make a copy to continue the chat.
            </Text>
            <Button
              size="compact-sm"
              variant="light"
              leftSection={<IconGitFork size={14} />}
              loading={cloningId === fileId}
              onClick={() => clone(fileId)}
            >
              Start from this
            </Button>
          </div>
        ) : (
          <ChatComposer
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStop={handleStop}
            isRunning={isRunning}
            hasPending={hasPending}
            selectedElement={selectedElement}
            model={model}
            onModelChange={handleModelChange}
            imageModel={imageModel}
            onImageModelChange={handleImageModelChange}
            effort={effort}
            supportedEfforts={supportedEfforts}
            onEffortChange={setEffort}
            credits={credits}
            isModelDisabled={isModelDisabled}
            history={isAnonymous === false ? inputHistory : []}
          />
        )}
      </div>
    </div>
  );
}
