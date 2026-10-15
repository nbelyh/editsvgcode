import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { notifications } from '@mantine/notifications';
import { ActionIcon, Tooltip, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEraser } from '@tabler/icons-react';
import { sendChatRequest, isCreditsError, type ImageConfirmKind, type ProgressStatus, type Credits, type IconResult, type ReadToolCall, type ChatLiveUpdate } from '../../lib/api-client';
import { subscribeCredits } from '../../lib/credits-listener';
import { createLiveReplyStore } from '../../lib/live-reply';
import { recordAiFeedback, failureOf, drawingShownFor, type FeedbackInput } from '../../lib/ai-feedback';
import { loadChatMessages, scheduleSaveChatMessages, clearChatMessages, getChatAccess, migrateLegacyChat } from '../../lib/chat-history';
import { friendlyError } from '../../lib/firebase';
import { addressForLineRange } from '../../lib/svg-dom';
import { DEFAULT_PRICING } from '../../lib/pricing';
import { EDIT_MODELS, IMAGE_MODELS, resolveEditModel, resolveImageModel, resolveImageStyle, type ImageStyle, type ReasoningEffort } from '../../lib/models';
import { ChatThread } from './ChatThread';
import { ChatComposer } from './ChatComposer';
import { openSignInModal } from '../SignInModal';
import { ForeignDocNotice } from '../ForeignDocNotice';
import { FOREIGN_DOC_CHAT_NOTICE } from '../../lib/visibility';
import type { DisplayMessage, AiChatProps } from './types';
import { type ProposalMeta, trackAiChat, trackAiAccept, trackAiReject, trackAiThumbsUp, trackAiThumbsDown, trackCreditsExhausted, trackImageGen, trackPastedSvg, trackPicture, trackImageDeclined } from '../../lib/analytics';
import { pastedSvgDocument } from '../../lib/pasted-svg';
import { rasterToPngDataUrl, TRACE_IMAGE_TOOL, REDRAW_IMAGE_TOOL, isPictureTool, isSvgFile, type PictureCardAction } from '../../lib/pasted-image';
import { traceToFit, generateImage, modifyImage, MAX_TRACE_CHARS, type VectorizerParams } from '../../lib/image-gen';
import { renderImage } from '../../lib/svg-export';
import type { PictureRequest } from '../../lib/open-from-url';
import { docOrigin } from '../../lib/doc-origin';
import { describeChatError } from '../../lib/chat-errors';
import '../AiChat.css';

const HISTORY_KEY = 'esvg-input-history';
const MAX_HISTORY = 100;

// Draft stashed when a guest hits send: sign-in is a full-page redirect (popup
// auth breaks under some browser extensions/VPNs), so React state does not
// survive it. sessionStorage does — Firebase's own redirect flow depends on it.
const PENDING_SEND_KEY = 'esvg-pending-send';

// 'true' while this device's last known account was a real one, not a guest's.
const SIGNED_IN_KEY = 'esvg-signed-in';

// Sent by the Continue button after a turn ran out of tool calls. It reads as a
// user message in the transcript, which is what it is — the previous turn's
// findings are already replayed as history, so the point is to stop it starting
// the search from scratch.
const CONTINUE_TEXT = 'Continue from where you stopped. Use what you already found instead of searching again, and make the edit now.';

// What the image model is asked by "Redraw as an illustration". The server adds its own rules
// for flat fills and keeping what the instruction does not change.
//
// Worded as a conversion of the same picture, not a redraw: "redraw" invited the model to
// restyle it, and an attached character came back as a generic one. Tested on a Tenniel
// illustration, this wording with gpt-image-1.5 at high fidelity kept the face, the hair and
// the drawing's own style.
const ILLUSTRATE_PROMPT = 'Convert this picture into flat-colour vector art of the SAME picture. Follow its linework faithfully: keep every character exactly as drawn — identity, face, expression, hair or fur, clothing, accessories — and keep the pose, composition, proportions and all the details. Do not restyle it, do not simplify it, do not invent features. Keep the colours it has. Only replace soft shading, hatching and texture with flat areas of colour.';

// The picture card's two buttons, which run without the chat model. `history` is what later
// turns are told the button did — without it "redraw it closer to the original" was answered
// with a request for the original.
const PICTURE_CARD: Record<PictureCardAction, { tool: string; request: string; reply: string; history: string; done: string; failed: string }> = {
  trace: {
    tool: TRACE_IMAGE_TOOL,
    request: 'Trace this picture to SVG',
    reply: 'Here is your picture traced to SVG. Adjust the sliders until it looks right, then Accept to open it in the editor. Tracing runs in your browser and uses no credits.',
    history: '[The user attached a picture and traced it to SVG in the browser; the traced drawing is the current document if they accepted it. You were not involved.]',
    done: 'Traced the picture to SVG.',
    failed: 'Could not trace that picture',
  },
  illustrate: {
    tool: REDRAW_IMAGE_TOOL,
    request: 'Redraw this picture as an illustration',
    reply: 'Here is your picture redrawn by the image model and traced to SVG. Adjust the sliders until it looks right, then Accept to open it in the editor.',
    history: '[The user attached a picture and had the image model redraw it as a flat-colour illustration, which was then traced to SVG; it is the current document if they accepted it. You were not involved.]',
    done: 'Redrew the picture with the image model and traced it to SVG.',
    failed: 'Could not redraw that picture',
  },
};

// A picture asked for in the address (open-from-url readPictureParam), after the user said yes
// on the card: like the picture card's buttons, it runs without the chat model. The MCP
// connector's picture tools hand off here from chats that show no widgets.
const REQUESTED_PICTURE: Record<PictureRequest['kind'], { tool: string; reply: string; history: string; done: string; failed: string }> = {
  generate: {
    tool: 'generate_image',
    reply: 'Here is the picture, generated by the image model and traced to SVG. Adjust the sliders until it looks right, then Accept to open it in the editor.',
    history: '[The user opened a link that asked for this picture and confirmed it; the image model generated it and it was traced to SVG. It is the current document if they accepted it. You were not involved.]',
    done: 'Generated the picture with the image model and traced it to SVG.',
    failed: 'Could not generate that picture',
  },
  modify: {
    tool: 'modify_image',
    reply: 'Here is the picture, changed by the image model and traced to SVG. Adjust the sliders until it looks right, then Accept to keep it.',
    history: '[The user opened a link that asked for this change and confirmed it; the image model redrew the drawing with it and the result was traced to SVG. It is the current document if they accepted it. You were not involved.]',
    done: 'Changed the picture with the image model and traced it to SVG.',
    failed: 'Could not change that picture',
  },
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('The drawing could not be read.'));
    reader.readAsDataURL(blob);
  });
}

// What later turns are told about a message that came with a picture. The picture itself is
// sent on its own turn only.
const PICTURE_IN_HISTORY = '\n\n[A picture was attached to this message. Later messages show it again for reference, until another is attached.]';

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

/** The analytics fields for an accepted or rejected proposal, from the turn that made it. A
 *  message loaded from storage has no turn; it falls back to the picker's settings and "no". */
function proposalMeta(msg: DisplayMessage | undefined, tool: string, userMsg: DisplayMessage | undefined, model: string, effort?: string): ProposalMeta {
  const turn = msg?.turn;
  return {
    model: turn?.model ?? model,
    ...(turn ? (turn.effort ? { effort: turn.effort } : {}) : effort ? { effort } : {}),
    tool,
    prompt_len: userMsg?.role === 'user' ? userMsg.content.length : 0,
    first_turn: turn?.firstTurn ? 'yes' : 'no',
    doc: turn?.doc ?? 'unknown',
    image_declined: turn?.imageDeclined ? 'yes' : 'no',
  };
}

export function AiChat({ svgCode, fileId, documentReady, selectedElement, selectedLineRange, visible = true, onPreviewSvg, onAcceptSvg, onRestore, onChatLoaded, onAccessResolved, onStartFrom, cloning, pictureRequest, onPictureRequestShown }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  // A picture attached to the message being written, as a PNG data URL, and whether the
  // question of what to do with it is showing — asked when it is sent without a message.
  const [attachment, setAttachment] = useState<string | null>(null);
  const [pictureChoice, setPictureChoice] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('thinking');
  // What the model is writing and thinking while a call runs, streamed. Kept out of React
  // state so a delta re-renders only the live bubble (see lib/live-reply); only the call in
  // progress is shown, and the finished answer replaces it as a message.
  const [live] = useState(createLiveReplyStore);
  // Which turn is current. A stopped turn can still be finishing work that ignores the abort
  // signal — vectorizing an image — and must not reset the live view or the run state of a
  // turn sent after it.
  const turnRef = useRef(0);
  const handleLiveUpdate = useCallback((update: ChatLiveUpdate) => {
    if (update.kind === 'start') live.reset();
    else if (update.kind === 'text') live.appendText(update.delta);
    else live.appendReasoning(update.delta);
  }, [live]);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [model, setModel] = useState(() => resolveEditModel(localStorage.getItem('esvg-model')));
  const [imageModel, setImageModel] = useState(() => resolveImageModel(localStorage.getItem('esvg-image-model')));
  const [imageStyle, setImageStyle] = useState<ImageStyle>(() => resolveImageStyle(localStorage.getItem('esvg-image-style')));
  // Read whenever a picture is made: the style is chosen on the card that asks, which for a
  // generated picture comes mid-turn, after the message was sent. Set where the choice is made,
  // so it is right the moment the box is ticked.
  const imageStyleRef = useRef(imageStyle);
  const [effortByModel, setEffortByModel] = useState<Record<string, ReasoningEffort>>(() => {
    try { return JSON.parse(localStorage.getItem('esvg-effort-by-model') || '{}'); } catch { return {}; }
  });
  // The address the model will be handed for this selection. Derived the same
  // way buildSvgContext derives it, so the badge names the element the request
  // will actually land on rather than a second opinion about it.
  //
  // Debounced, and keyed on the line NUMBERS rather than the range object.
  // Deriving an address parses the document, which is ~100 ms on a large traced
  // drawing and cannot be made cheaper; typing re-creates both `svgCode` and a
  // fresh `{start, end}` object on every keystroke, so an undebounced memo on
  // the object identity ran that parse per character and froze the editor. The
  // badge is a label, so it can lag the cursor by a moment; what it must never
  // do is cost a frame. The model's own copy is derived at send time and is
  // unaffected by this.
  const [debouncedSvg] = useDebouncedValue(svgCode, 300);
  const selStart = selectedLineRange?.start;
  const selEnd = selectedLineRange?.end;
  const selectedAddress = useMemo(
    () => (visible && selectedElement && selStart !== undefined && selEnd !== undefined
      ? addressForLineRange(debouncedSvg, { start: selStart, end: selEnd }, selectedElement)
      : null),
    [visible, debouncedSvg, selectedElement, selStart, selEnd],
  );
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
  // Unknown until the credits listener has answered: the default above reads a Pro account as
  // free, and a failure must not be kept on that guess.
  const feedbackTier = credits ? tier : null;
  // One record per turn: a refused edit that is then rejected and rated down is one failure,
  // not three copies of the drawing.
  const recordedTurnsRef = useRef(new Set<string>());
  const keepFailure = useCallback((input: FeedbackInput) => {
    const id = input.message?.turn?.id;
    if (id && recordedTurnsRef.current.has(id)) return;
    if (recordAiFeedback(input) && id) recordedTurnsRef.current.add(id);
  }, []);
  // null = auth not yet known (Firebase still restoring the session after page
  // load). Distinct from anonymous: a signed-in user must not be treated as a
  // guest during the restore window, so auth-gated paths wait for a real value.
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(() => {
    const user = getAuth().currentUser;
    return user ? user.isAnonymous : null;
  });
  // The guest note under the sample prompts is the largest text in a phone's
  // empty chat, so it is the page's largest paint. Waiting for isAnonymous held
  // it — and LCP with it — until the anonymous sign-in came back from the
  // network, seconds after everything else had painted. Whether this device was
  // last signed in is remembered instead, so the note paints with the page; a
  // signed-in user sees it at most once, on the first load after this shipped.
  const [showGuestNote, setShowGuestNote] = useState(() => {
    try { return localStorage.getItem(SIGNED_IN_KEY) !== 'true'; } catch { return true; }
  });
  useEffect(() => {
    return onAuthStateChanged(getAuth(), (user) => {
      setIsAnonymous(user ? user.isAnonymous : null);
      // null is the gap before the anonymous sign-in lands, not an answer.
      if (!user) return;
      setShowGuestNote(user.isAnonymous);
      try { localStorage.setItem(SIGNED_IN_KEY, String(!user.isAnonymous)); } catch { /* storage unavailable: the note shows until auth answers */ }
    });
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
  // Access costs a Firestore read, so `isViewer` is not trustworthy until it
  // lands. Showing the composer meanwhile offers an edit the visitor cannot
  // make and then snatches it back — opening a gallery drawing flashed a live
  // composer before the read-only notice replaced it. Withhold both until the
  // verdict is in; the thread is still loading through the same window anyway.
  const [accessPending, setAccessPending] = useState(true);

  // Mirror the verdict up to the page rather than notifying at each of the
  // setIsViewer sites, so the two cannot drift apart. Also fires the initial
  // false, which resets the page when switching to a document of our own.
  useEffect(() => { onAccessResolved?.(isViewer); }, [isViewer, onAccessResolved]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  // A sample prompt fills the composer and hands it the caret, ready to send or change. The
  // click leaves focus on the sample's own button, so Enter did nothing and typing went
  // nowhere: the composer only took focus when the panel opened. A frame's wait lets the new
  // value commit first, so the caret lands at its end.
  const handleSamplePrompt = useCallback((text: string) => {
    setInput(text);
    requestAnimationFrame(() => {
      const textarea = composerRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(text.length, text.length);
    });
  }, []);
  const abortRef = useRef<AbortController | null>(null);
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
    setAccessPending(true);
    onPreviewSvg(null);
    let cancelled = false;
    let loadedFor: string | null = null;
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      if (cancelled) return;
      if (!user) {
        // Signed out entirely: there is no account for a document to be foreign
        // to, and getChatAccess would say the same. Nothing to wait for.
        setAccessPending(false);
        return;
      }
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
          setAccessPending(false);
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
        setAccessPending(false);
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
            const pending = JSON.parse(raw) as { fileId?: string; text?: string; picture?: string | null };
            if (pending.fileId === fileId) {
              sessionStorage.removeItem(PENDING_SEND_KEY);
              if (pending.text && !inputRef.current.trim()) {
                setInput(pending.text);
                if (pending.picture) setAttachment(pending.picture);
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

  // Keep the end of the thread in view — while the reader is at it. A reply streams in
  // many times a second, and pulling the view down on each delta made everything further up
  // unreadable until the call ended. A reader who scrolls up now stays where they put
  // themselves; sending a message follows the thread again (see handleSend). The jump is
  // instant rather than smooth: a smooth scroll restarted on every frame never arrives.
  //
  // Scroll the thread's own container rather than endRef.scrollIntoView():
  // scrollIntoView walks every scrollable ancestor, and the phone layout wraps
  // the whole editor in one so the ad can sit below the fold. Revealing the end
  // of the chat therefore scrolled that outer container too, dragging the ad
  // into view on open — the effect runs on mount, before there are any messages
  // to scroll to. Setting scrollTop here cannot move anything but the thread.
  const pinnedRef = useRef(true);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onScroll = () => {
      pinnedRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48;
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);
  const followBottom = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport && pinnedRef.current) viewport.scrollTop = viewport.scrollHeight;
  }, []);
  useEffect(() => {
    // An empty chat is read from the top. Pinned to the bottom like a thread,
    // a short phone panel scrolled the first thing in it — the Paste SVG code
    // button — out of sight.
    if (messages.length === 0 && !pictureChoice) {
      if (viewportRef.current) viewportRef.current.scrollTop = 0;
      return;
    }
    followBottom();
  }, [messages, isRunning, pictureChoice, followBottom]);

  // A message that is nothing but an SVG document is opened in the editor, with no model call:
  // the person wants to see it, not have it changed. Restore above the message puts the
  // drawing back, like after any accepted edit.
  const openPastedSvg = useCallback((text: string, pasted: string, source: 'message' | 'button' | 'file') => {
    const prevSvg = svgRef.current;
    onPreviewSvg(null);
    onAcceptSvg(pasted);
    trackPastedSvg(source);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text },
      {
        role: 'assistant',
        content: 'Opened your SVG in the editor. Ask me to change anything in it, or press Restore above your message to get back the drawing you had.',
        toolCalls: [{ name: 'replace_svg', arguments: { svg: pasted, summary: 'Opened the pasted SVG' }, status: 'accepted', prevSvg }],
      },
    ]);
  }, [onAcceptSvg, onPreviewSvg]);

  // The phone's way in for SVG code. Focusing the composer to invite a paste
  // would raise the on-screen keyboard over half the screen, so the button
  // reads the clipboard itself; the browser asks for permission or shows its
  // own Paste prompt, and nothing takes focus.
  //
  // Held to what the composer is held to: not before the chat and the
  // document have loaded — the load would replace the opened drawing's
  // messages, and a viewer's access is not known yet — and not during a run.
  // Read through a ref because it must be checked again once the clipboard
  // answers: the browser's Paste prompt can stay open while a deferred send
  // starts.
  const canPaste = !accessPending && !isViewer && documentReady && !isRunning && !hasPending;
  const canPasteRef = useRef(canPaste);
  canPasteRef.current = canPaste;
  const handlePasteSvg = useCallback(async () => {
    if (!canPasteRef.current) return;
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      notifications.show({
        title: 'Could not read the clipboard',
        message: 'This browser did not allow it. Long-press the message box below and choose Paste instead.',
        color: 'red',
      });
      return;
    }
    const pasted = pastedSvgDocument(text);
    if (!pasted) {
      notifications.show({
        title: 'No SVG code on the clipboard',
        message: 'Copy the whole SVG code, from <svg to </svg>, and tap Paste again.',
        color: 'yellow',
      });
      return;
    }
    if (!canPasteRef.current) return;
    openPastedSvg(text.trim(), pasted, 'button');
  }, [openPastedSvg]);

  // A picture pasted, dropped or picked with the attach button. An SVG file opens like pasted
  // SVG code; anything else is attached to the message being written, at the size it would be
  // traced at. Refused while the chat cannot take a message, with a word why — the paste or
  // drop was already taken from the browser.
  const handleAttach = useCallback(async (file: File, source: 'paste' | 'drop' | 'button') => {
    if (!canPasteRef.current) {
      notifications.show({ title: 'Not ready for a picture yet', message: 'Wait for the document to load, then add the picture again.', color: 'yellow' });
      return;
    }
    if (isSvgFile(file)) {
      const text = await file.text().catch(() => '');
      const svg = pastedSvgDocument(text);
      if (!svg) {
        notifications.show({ title: 'Could not open that SVG file', message: 'It does not hold an SVG document the browser can read.', color: 'red' });
        return;
      }
      if (canPasteRef.current) openPastedSvg(text.trim(), svg, 'file');
      return;
    }
    let picture: string;
    try {
      picture = await rasterToPngDataUrl(file);
    } catch {
      trackPicture('failed', source);
      notifications.show({ title: 'Could not read that picture', message: 'Try it as a PNG or JPEG image.', color: 'red' });
      return;
    }
    setAttachment(picture);
    setPictureChoice(false);
    trackPicture('attached', source);
    composerRef.current?.focus();
  }, [openPastedSvg]);

  const handleRemoveAttachment = useCallback(() => {
    setAttachment(null);
    setPictureChoice(false);
  }, []);

  // The picture card's buttons. The picture stays in the message box while they run, so a
  // stop or a failure leaves nothing to undo; on success the request and its proposal are
  // added together. Tracing ignores Stop, so a stopped run finishes unseen: the turn counter
  // tells.
  const runPictureAction = useCallback(async (
    action: PictureCardAction,
    work: (picture: string, signal: AbortSignal, onProgress: (s: ProgressStatus) => void) => Promise<{ svg: string; pngDataUrl: string; params: VectorizerParams }>,
  ) => {
    const picture = attachment;
    if (!picture || !canPasteRef.current) return;
    const card = PICTURE_CARD[action];
    trackPicture(action);
    setPictureChoice(false);
    const turn = ++turnRef.current;
    const abort = new AbortController();
    abortRef.current = abort;
    live.reset();
    setIsRunning(true);
    setProgressStatus(action === 'trace' ? 'vectorizing' : 'modifying-image');
    pinnedRef.current = true;
    try {
      const result = await work(picture, abort.signal, (s) => { if (turnRef.current === turn) setProgressStatus(s); });
      if (turnRef.current !== turn) return;
      if (result.svg.length > MAX_TRACE_CHARS) {
        notifications.show({ title: 'This picture is too detailed to trace', message: 'Try a simpler picture, such as a logo or an icon.', color: 'yellow' });
        return;
      }
      setAttachment(null);
      setMessages(prev => [
        ...prev,
        { role: 'user', content: card.request, picture, action },
        {
          role: 'assistant',
          content: card.reply,
          toolCalls: [{ name: card.tool, arguments: { svg: result.svg, pngDataUrl: result.pngDataUrl, vectorizerParams: result.params, summary: card.request }, status: 'pending' }],
          rawItems: [{ role: 'user', content: `${card.request}\n\n${card.history}` }, { role: 'assistant', content: card.done }],
        },
      ]);
      onPreviewSvg(result.svg);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError' || turnRef.current !== turn) return;
      if (isCreditsError(err)) {
        trackCreditsExhausted();
        setMessages(prev => [...prev, { role: 'assistant', content: (err as Error).message, buyCredits: true }]);
      } else {
        notifications.show({ title: card.failed, message: 'The picture is still in the message box. Try again, or choose another way.', color: 'red' });
      }
    } finally {
      if (turnRef.current === turn) {
        setIsRunning(false);
        abortRef.current = null;
      }
    }
  }, [attachment, live, onPreviewSvg]);

  // "Trace to SVG": in the browser, no model call, no credit.
  const handleTrace = useCallback(() => runPictureAction('trace', async (picture) => {
    const { svg, params } = await traceToFit(picture);
    return { svg, pngDataUrl: picture, params };
  }), [runPictureAction]);

  // "Redraw as an illustration": straight to the image model, with no chat model to decide
  // anything and so no second question.
  const handleIllustrate = useCallback(() => {
    if (isAnonymous !== false) {
      if (isAnonymous) openSignInModal(`Redrawing a picture needs a free account, with ${DEFAULT_PRICING.freeMonthlyCredits} AI credits included every month. Tracing it works without one.`);
      return;
    }
    void runPictureAction('illustrate', async (picture, signal, onProgress) => {
      const result = await modifyImage(ILLUSTRATE_PROMPT, picture, imageModel, signal, onProgress, imageStyleRef.current);
      trackImageGen(imageModel);
      return result;
    });
  }, [isAnonymous, imageModel, runPictureAction]);

  // A picture asked for in the address, once the user said yes on the card. A change starts
  // from the drawing as it is, rendered to a PNG here, as the MCP widget does.
  const runRequestedPicture = useCallback(async ({ kind, prompt }: PictureRequest) => {
    const card = REQUESTED_PICTURE[kind];
    const turn = ++turnRef.current;
    const abort = new AbortController();
    abortRef.current = abort;
    live.reset();
    setIsRunning(true);
    setProgressStatus(kind === 'modify' ? 'modifying-image' : 'generating-image');
    pinnedRef.current = true;
    try {
      const onProgress = (s: ProgressStatus) => { if (turnRef.current === turn) setProgressStatus(s); };
      let result: { svg: string; pngDataUrl: string; params: VectorizerParams };
      if (kind === 'modify') {
        const rendered = await renderImage(svgCode, { size: { width: 1024 }, format: 'png', background: null });
        if ('error' in rendered) throw new Error(rendered.error);
        result = await modifyImage(prompt, await blobToDataUrl(rendered.blob), imageModel, abort.signal, onProgress, imageStyleRef.current);
      } else {
        result = await generateImage(prompt, imageModel, abort.signal, onProgress, imageStyleRef.current);
      }
      trackImageGen(imageModel);
      if (turnRef.current !== turn) return;
      if (result.svg.length > MAX_TRACE_CHARS) {
        notifications.show({ title: 'This picture is too detailed to trace', message: 'Ask for a simpler picture, such as a logo or an icon.', color: 'yellow' });
        return;
      }
      setMessages(prev => [
        ...prev,
        { role: 'user', content: prompt },
        {
          role: 'assistant',
          content: card.reply,
          toolCalls: [{ name: card.tool, arguments: { svg: result.svg, pngDataUrl: result.pngDataUrl, vectorizerParams: result.params, summary: prompt }, status: 'pending' }],
          rawItems: [{ role: 'user', content: `${prompt}\n\n${card.history}` }, { role: 'assistant', content: card.done }],
        },
      ]);
      onPreviewSvg(result.svg);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError' || turnRef.current !== turn) return;
      if (isCreditsError(err)) {
        trackCreditsExhausted();
        setMessages(prev => [...prev, { role: 'assistant', content: (err as Error).message, buyCredits: true }]);
      } else {
        notifications.show({ title: card.failed, message: friendlyError(err), color: 'red' });
      }
    } finally {
      if (turnRef.current === turn) {
        setIsRunning(false);
        abortRef.current = null;
      }
    }
  }, [live, onPreviewSvg, imageModel, svgCode]);

  // The address's picture request becomes the picture card once the chat can take it: loaded,
  // the user's own, signed in. Declining leaves the request in the message box, to have the chat
  // model draw it with shapes instead.
  const signInAskedRef = useRef(false);
  /** The request on show, worded by the user on the card before they answer it. */
  const [requestOnCard, setRequestOnCard] = useState<PictureRequest | null>(null);
  const requestOnCardRef = useRef<PictureRequest | null>(null);
  requestOnCardRef.current = requestOnCard;
  const handleImagePromptChange = useCallback((prompt: string) => {
    setRequestOnCard((r) => (r ? { ...r, prompt } : r));
    setImageConfirmSummary((s) => (s?.startsWith('modify:') ? `modify:${prompt}` : prompt));
  }, []);
  useEffect(() => {
    if (!pictureRequest || accessPending || !documentReady || isRunning || imageConfirmSummary) return;
    if (isAnonymous !== false) {
      if (isAnonymous && !signInAskedRef.current) {
        signInAskedRef.current = true;
        openSignInModal(`Generating a picture needs a free account, with ${DEFAULT_PRICING.freeMonthlyCredits} AI credits included every month.`);
      }
      return;
    }
    onPictureRequestShown?.();
    if (!canWrite) return;
    setRequestOnCard(pictureRequest);
    setImageConfirmSummary(pictureRequest.kind === 'modify' ? `modify:${pictureRequest.prompt}` : pictureRequest.prompt);
    imageConfirmResolveRef.current = (confirmed) => {
      // As worded on the card, which may differ from the link's.
      const request = requestOnCardRef.current ?? pictureRequest;
      setImageConfirmSummary(null);
      setRequestOnCard(null);
      imageConfirmResolveRef.current = null;
      if (confirmed) void runRequestedPicture({ ...request, prompt: request.prompt.trim() });
      else setInput(request.prompt);
    };
  }, [pictureRequest, accessPending, documentReady, isRunning, imageConfirmSummary, isAnonymous, canWrite, onPictureRequestShown, runRequestedPicture]);

  const handlePictureChoiceClose = useCallback(() => setPictureChoice(false), []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    const picture = attachment;
    // hasPending guards programmatic callers (deferred sends) — interactive
    // paths are already blocked by the composer's disabled state.
    if ((!text && !picture) || isRunning || hasPending) return;

    // A picture sent with no words: ask what to do with it.
    if (!text) {
      setPictureChoice(true);
      return;
    }

    const pasted = !picture && pastedSvgDocument(text);
    if (pasted) {
      openPastedSvg(text, pasted, 'message');
      setInput('');
      return;
    }

    // The API drops a picture sent to a model that takes text only, and the reply would then
    // talk about a picture it never saw.
    if (picture && currentModelDef?.vision === false) {
      notifications.show({ title: 'This model cannot see pictures', message: 'Pick another model in the menu below the message box to send a picture.', color: 'yellow' });
      return;
    }

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
        // A picture is megabytes, and session storage may not hold it. Then nothing is kept and
        // the modal does not promise that it is.
        let kept = true;
        try { sessionStorage.setItem(PENDING_SEND_KEY, JSON.stringify({ fileId, text, picture })); } catch { kept = false; }
        openSignInModal(
          kept
            ? `AI needs a free account. Your message is kept and will be sent automatically after you sign in — ${DEFAULT_PRICING.freeMonthlyCredits} AI credits included every month.`
            : `AI needs a free account, with ${DEFAULT_PRICING.freeMonthlyCredits} AI credits included every month. Sign in, then send your message again.`,
          { onClose: () => sessionStorage.removeItem(PENDING_SEND_KEY) },
        );
      }
      return;
    }

    const userMsg: DisplayMessage = picture ? { role: 'user', content: text, picture } : { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachment(null);
    setPictureChoice(false);
    if (picture) trackPicture('sent');
    setIsRunning(true);
    setProgressStatus('thinking');
    const turn = ++turnRef.current;
    // Lower effort for image-generation prompts — reasoning doesn't help much there.
    const sentEffort = supportedEfforts && looksLikeImageGen(text) ? 'low' : effort;
    const turnInfo: NonNullable<DisplayMessage['turn']> = {
      id: crypto.randomUUID(), model, effort: sentEffort,
      firstTurn: !messages.some((m) => m.role === 'user'),
      doc: docOrigin(svgCode),
    };
    live.reset();
    // Sending asks to see the reply: follow it even from further up the thread.
    pinnedRef.current = true;

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

      const handleImageConfirm = (summary: string, kind: ImageConfirmKind): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
          setImageConfirmSummary(kind === 'generate' ? summary : `${kind}:${summary}`);
          imageConfirmResolveRef.current = (confirmed) => {
            setImageConfirmSummary(null);
            imageConfirmResolveRef.current = null;
            // Kept on the turn, so whatever the user then does with the hand drawing that
            // follows can be told apart from a hand drawing the model chose.
            if (!confirmed) turnInfo.imageDeclined = true;
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
            if (isPictureTool(tc.name) && tc.status === 'accepted' && tc.arguments.pngDataUrl) {
              lastPngDataUrl = tc.arguments.pngDataUrl as string;
              break;
            }
          }
          if (lastPngDataUrl) break;
        }
      }

      // With no picture on this message, the one attached most recently is shown again, so a
      // follow-up about it can be answered. Not to a model that cannot see it.
      let reference: string | undefined;
      if (!picture && currentModelDef?.vision !== false) {
        for (let i = messages.length - 1; i >= 0 && !reference; i--) {
          if (messages[i].role === 'user') reference = messages[i].picture;
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
        sentEffort,
        handleIconPick,
        (tc) => collectedToolCalls.push(tc),
        handleImageConfirm,
        lastPngDataUrl,
        (update) => {
          if (turnRef.current === turn) handleLiveUpdate(update);
        },
        picture ?? undefined,
        reference,
        () => imageStyleRef.current,
      );

      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls?.map(tc => ({
          ...tc,
          // A call that produced no SVG is normally one that needs no approval
          // (an image tool that already ran). A call the client REFUSED also has
          // no SVG, and used to fall through to the same branch — so an edit
          // that changed nothing rendered with a green "Accepted" badge.
          status: tc.arguments.svg
            ? 'pending' as const
            : tc.arguments.notExecuted ? 'rejected' as const : 'accepted' as const,
        })),
        rawItems: [
          { role: 'user', content: picture ? text + PICTURE_IN_HISTORY : text },
          ...response.rawOutput,
        ],
        selectedIcon: selectedIcon ?? undefined,
        readToolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
        outOfToolRounds: response.outOfToolRounds ? true : undefined,
        reasoning: response.reasoning,
        turn: turnInfo,
      };

      setMessages(prev => [...prev, assistantMsg]);

      trackAiChat(model, sentEffort);
      if (response.toolCalls?.some(tc => tc.name === 'generate_image' || tc.name === 'modify_image')) {
        trackImageGen(imageModel);
      }
      const firstSvg = response.toolCalls?.find(tc => tc.arguments.svg)?.arguments.svg as string | undefined;
      if (firstSvg) onPreviewSvg(firstSvg);

      // A turn that went wrong without the user having to say so: an edit refused, partly
      // applied or breaking the drawing, or a turn that ran out of tool calls.
      const failure = failureOf(assistantMsg);
      if (failure) {
        keepFailure({
          kind: failure, fileId, prompt: text, response: assistantMsg.content, model, effort: sentEffort,
          tier: feedbackTier, svg: svgCode, proposedSvg: firstSvg, message: assistantMsg, history: messages,
        });
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const creditsErr = isCreditsError(err);
      if (creditsErr) trackCreditsExhausted();
      const errMsg = (err as Error).message;
      const shown = creditsErr ? { text: errMsg, retry: false } : describeChatError(errMsg);
      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: shown.text,
        buyCredits: creditsErr || undefined,
        retry: shown.retry || undefined,
        turn: turnInfo,
      };
      // Running out of credits is the paywall working, not the assistant failing.
      if (!creditsErr) {
        keepFailure({
          kind: 'error', fileId, prompt: text, error: errMsg, model, effort: sentEffort, tier: feedbackTier,
          svg: svgCode, message: assistantMsg, history: messages,
        });
      }
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      // A turn that Stop already ended, or that a newer send replaced, leaves the panel alone.
      if (turnRef.current === turn) {
        setIsRunning(false);
        live.reset();
        abortRef.current = null;
        setIconPickIcons(null);
        setSelectedIcon(null);
        setImageConfirmSummary(null);
        imageConfirmResolveRef.current = null;
      }
    }
  }, [input, attachment, currentModelDef, isRunning, hasPending, isAnonymous, fileId, messages, svgCode, selectedElement, selectedLineRange, model, imageModel, effort, handleLiveUpdate, live, feedbackTier, keepFailure, onAcceptSvg, onPreviewSvg, openPastedSvg]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    // Settle pending in-chat prompts — sendChatRequest awaits their promises,
    // which the abort signal can't interrupt; the resolved continuation then
    // hits the aborted fetch and unwinds with AbortError.
    iconPickResolveRef.current?.('none');
    imageConfirmResolveRef.current?.(false);
    // The stopped turn is no longer current: whatever it is still finishing must not touch
    // the panel, least of all a turn sent after this.
    turnRef.current++;
    setIsRunning(false);
    live.reset();
    setIconPickIcons(null);
    setSelectedIcon(null);
    setImageConfirmSummary(null);
    iconPickResolveRef.current = null;
    imageConfirmResolveRef.current = null;
  }, [live]);

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
    if (userMsg?.role === 'user') {
      if (userMsg.content && !userMsg.action) setInput(userMsg.content);
      if (userMsg.picture) setAttachment(userMsg.picture);
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
    if (msg?.role === 'user' && !msg.action) {
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
    setAttachment(messages[msgIdx]?.picture ?? null);
    // We need to trigger send after state updates, so use a ref flag
    pendingSendRef.current = true;
  }, [isRunning, messages, fileId, onPreviewSvg, onRestore, restoreTarget]);

  // Resume a turn that stopped on its tool-call limit. Goes through the same
  // deferred send as edit-resubmit, so the guards (auth, isRunning, document
  // loaded) all still apply — and the stored rawItems mean the model gets back
  // everything it had already found rather than starting the search over.
  // Send a failed request again: the failed turn goes, and its prompt goes back out through the
  // deferred send, with every guard handleSend applies.
  const handleRetry = useCallback((msgIdx: number) => {
    const userMsg = messages[msgIdx - 1];
    if (isRunning || hasPending || userMsg?.role !== 'user') return;
    const kept = messages.slice(0, msgIdx - 1);
    setMessages(kept);
    scheduleSaveChatMessages(fileId, kept);
    setInput(userMsg.content);
    setAttachment(userMsg.picture ?? null);
    pendingSendRef.current = true;
  }, [messages, isRunning, hasPending, fileId]);

  const handleContinue = useCallback(() => {
    if (isRunning || hasPending) return;
    setInput(CONTINUE_TEXT);
    pendingSendRef.current = true;
  }, [isRunning, hasPending]);

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
    // Counted once: Restore puts an accepted proposal back to pending, keeping its prevSvg.
    const action = messages[msgIndex - 1]?.action;
    if (action) { if (!tc.prevSvg) trackPicture(`${action}_accepted`); }
    else trackAiAccept(proposalMeta(msg, tc?.name ?? '', messages[msgIndex - 1], model, effort));
    onPreviewSvg(null);

    setMessages(prev => prev.map((m, i) =>
      i !== msgIndex ? m : {
        ...m,
        toolCalls: m.toolCalls?.map((t, j) =>
          j === tcIndex ? { ...t, status: 'accepted' as const, prevSvg } : t
        ),
      }
    ));
  }, [messages, onAcceptSvg, onPreviewSvg, model, effort]);

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
    const msg = messages[msgIndex];
    const tc = msg?.toolCalls?.[tcIndex];
    const userMsg = messages[msgIndex - 1];

    // Both messages go, and the chat is saved here: rejecting the only turn empties it, and an
    // empty chat is not saved by the effect that saves the others.
    const kept = messages.filter((_, i) => i !== msgIndex - 1 && i !== msgIndex);

    // A picture card button's result is not the chat model's answer: nothing to record. The
    // picture goes back to the message box, to be tried another way or sent with a message.
    if (userMsg?.action) {
      trackPicture(`${userMsg.action}_rejected`);
      onPreviewSvg(null);
      setMessages(kept);
      scheduleSaveChatMessages(fileId, kept);
      if (userMsg.picture) setAttachment(userMsg.picture);
      return;
    }

    trackAiReject(proposalMeta(msg, tc?.name ?? '', userMsg, model, effort));
    // The turn is removed from the chat just below, so this is the last chance to keep it.
    if (msg) {
      keepFailure({
        kind: 'reject', fileId, prompt: userMsg?.role === 'user' ? userMsg.content : '', response: msg.content,
        model: msg.turn?.model ?? model, effort: msg.turn ? msg.turn.effort : effort, tier: feedbackTier,
        svg: drawingShownFor(msg, svgRef.current), proposedSvg: tc?.arguments.svg as string | undefined,
        message: msg, history: messages.slice(0, Math.max(0, msgIndex - 1)),
      });
    }

    onPreviewSvg(null);

    const restoredText = userMsg?.role === 'user' ? userMsg.content : '';

    setMessages(kept);
    scheduleSaveChatMessages(fileId, kept);
    setInput(restoredText);
    setAttachment(userMsg?.role === 'user' ? userMsg.picture ?? null : null);
  }, [messages, onPreviewSvg, model, effort, fileId, feedbackTier, keepFailure]);

  const handleThumbsUp = useCallback((msgIndex: number) => {
    const userMsg = messages[msgIndex - 1];
    const promptLen = userMsg?.role === 'user' ? userMsg.content.length : 0;
    trackAiThumbsUp({ model, effort, prompt_len: promptLen });
  }, [messages, model, effort]);

  const handleThumbsDown = useCallback((msgIndex: number, prompt: string) => {
    const msg = messages[msgIndex];
    const userMsg = messages[msgIndex - 1];
    const promptLen = userMsg?.role === 'user' ? userMsg.content.length : 0;
    trackAiThumbsDown({ model, effort, prompt_len: promptLen, shared: !!prompt });
    // The prompt asks "Share chat and drawing?", so only Share keeps anything — on any
    // tier — and Skip keeps nothing, free tier included. It used to send analytics a yes/no
    // and store nothing either way.
    if (msg && prompt) {
      keepFailure({
        kind: 'thumbs_down', shared: true, fileId, prompt: userMsg?.role === 'user' ? userMsg.content : '',
        response: msg.content, model: msg.turn?.model ?? model, effort: msg.turn ? msg.turn.effort : effort,
        tier: feedbackTier, svg: drawingShownFor(msg, svgRef.current),
        proposedSvg: msg.toolCalls?.find(tc => tc.arguments.svg)?.arguments.svg as string | undefined,
        message: msg, history: messages.slice(0, Math.max(0, msgIndex - 1)),
      });
    }
  }, [messages, model, effort, fileId, feedbackTier, keepFailure]);

  const handleModelChange = useCallback((v: string) => {
    setModel(v);
    localStorage.setItem('esvg-model', v);
  }, []);

  const handleImageModelChange = useCallback((v: string) => {
    setImageModel(v);
    localStorage.setItem('esvg-image-model', v);
  }, []);

  const handleImageStyleChange = useCallback((v: ImageStyle) => {
    imageStyleRef.current = v;
    setImageStyle(v);
    try { localStorage.setItem('esvg-image-style', JSON.stringify(v)); } catch { /* storage unavailable: the choice lasts the session */ }
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
    // Counted, because a third of these offers were turned down and the only other trace of
    // a decline is the length of a message sent to the model.
    trackImageDeclined({ model: imageModel, modify: !!imageConfirmSummary && /^(modify|picture):/.test(imageConfirmSummary) });
    imageConfirmResolveRef.current?.(false);
  }, [imageModel, imageConfirmSummary]);

  return (
    <div className="aui-root">
      <div className="aui-header">
        {/* Titled to match the Info tab's header, so switching tabs keeps the
            same bar rather than swapping a labelled one for a bare one. */}
        <Text size="xs" fw={600} c="dimmed" mr="auto">AI Chat</Text>
        {isViewer && <Text size="xs" c="dimmed">Read-only — shared by the author</Text>}
        <Tooltip label="Clear Chat">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleNewChat} disabled={isRunning || hasPending || messages.length === 0 || isViewer} aria-label="Clear chat">
            <IconEraser size={16} />
          </ActionIcon>
        </Tooltip>
      </div>
      <div className="aui-thread">
        <ChatThread
          messages={messages}
          isRunning={isRunning}
          progressStatus={progressStatus}
          live={live}
          onLiveGrow={followBottom}
          canUndo={canUndo}
          showGuestNote={showGuestNote}
          isViewer={isViewer}
          viewportRef={viewportRef}
          onAccept={handleAccept}
          onReject={handleReject}
          onUpdateToolCallSvg={handleUpdateToolCallSvg}
          onUndoAccept={handleUndoAccept}
          onRestore={handleRestore}
          onThumbsUp={handleThumbsUp}
          onThumbsDown={handleThumbsDown}
          onContinue={handleContinue}
          onRetry={handleRetry}
          hasPending={hasPending}
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
          onImagePromptChange={requestOnCard ? handleImagePromptChange : undefined}
          imageCredits={IMAGE_MODELS.find((m) => m.value === imageModel)?.credits ?? 0}
          imageStyle={imageStyle}
          onImageStyleChange={handleImageStyleChange}
          onImageConfirm={handleImageConfirmYes}
          onImageDecline={handleImageConfirmNo}
          onSamplePrompt={handleSamplePrompt}
          onPasteSvg={handlePasteSvg}
          canPaste={canPaste}
          pictureChoice={pictureChoice && !!attachment && !input.trim() && !isRunning}
          pictureLikenessHint={!IMAGE_MODELS.find((m) => m.value === imageModel)?.fidelity}
          onTrace={handleTrace}
          onIllustrate={handleIllustrate}
          onPictureChoiceClose={handlePictureChoiceClose}
        />
        {accessPending ? null : isViewer ? (
          // Somebody else's document: the conversation is readable but not
          // continuable. Forking gives the visitor a draft of their own —
          // chat, document and all — which they can carry on from.
          <ForeignDocNotice
            message={FOREIGN_DOC_CHAT_NOTICE}
            onStartFrom={onStartFrom}
            cloning={cloning}
          />
        ) : (
          <ChatComposer
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStop={handleStop}
            isRunning={isRunning}
            hasPending={hasPending}
            selectedElement={selectedElement}
            selectedAddress={selectedAddress}
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
            inputRef={composerRef}
            attachment={attachment}
            onAttach={handleAttach}
            onRemoveAttachment={handleRemoveAttachment}
          />
        )}
      </div>
    </div>
  );
}
