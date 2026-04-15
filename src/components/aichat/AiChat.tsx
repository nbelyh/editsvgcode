import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconEraser } from '@tabler/icons-react';
import { sendChatRequest, isCreditsError, type ProgressStatus, type Credits } from '../../lib/api-client';
import { subscribeCredits } from '../../lib/credits-listener';
import { loadChatMessages, saveChatMessages, clearChatMessages } from '../../lib/chat-storage';
import { EDIT_MODELS, type ReasoningEffort } from '../../lib/models';
import { ChatThread } from './ChatThread';
import { ChatComposer } from './ChatComposer';
import type { DisplayMessage, AiChatProps } from './types';
import '../AiChat.css';

export function AiChat({ svgCode, fileId, selectedElement, selectedLineRange, onPreviewSvg, onAcceptSvg, onRestore, canUndo }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('thinking');
  const [credits, setCredits] = useState<Credits | null>(null);
  const [model, setModel] = useState(() => localStorage.getItem('esvg-model') || 'gpt-5.4-mini');
  const [imageModel, setImageModel] = useState(() => localStorage.getItem('esvg-image-model') || 'gpt-image-1-mini');
  const [effortByModel, setEffortByModel] = useState<Record<string, ReasoningEffort>>(() => {
    try { return JSON.parse(localStorage.getItem('esvg-effort-by-model') || '{}'); } catch { return {}; }
  });
  const currentModelDef = useMemo(() => EDIT_MODELS.find(m => m.value === model), [model]);
  const supportedEfforts = currentModelDef?.efforts;
  const effort: ReasoningEffort | undefined = supportedEfforts ? (effortByModel[model] ?? 'high') : undefined;
  const setEffort = useCallback((v: ReasoningEffort) => {
    setEffortByModel(prev => {
      const next = { ...prev, [model]: v };
      localStorage.setItem('esvg-effort-by-model', JSON.stringify(next));
      return next;
    });
  }, [model]);
  const tier = credits?.tier ?? 'free';
  const isAnonymous = getAuth().currentUser?.isAnonymous ?? true;
  const isDebug = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isModelDisabled = useCallback((m: { pro: boolean }) => !isDebug && tier !== 'pro' && m.pro, [isDebug, tier]);
  const hasPending = messages.some(m => m.toolCalls?.some(tc => tc.status === 'pending'));

  const viewportRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  // Subscribe to real-time credit balance from Firestore
  useEffect(() => {
    return subscribeCredits(setCredits);
  }, []);

  // Load messages from IndexedDB on mount and when fileId changes
  useEffect(() => {
    loadedRef.current = false;
    setMessages([]);
    onPreviewSvg(null);
    loadChatMessages<DisplayMessage>(fileId).then((stored) => {
      setMessages(stored);
      loadedRef.current = true;
    });
  }, [fileId]);

  // Save messages to IndexedDB on change
  useEffect(() => {
    if (loadedRef.current) {
      saveChatMessages(messages, fileId);
    }
  }, [messages, fileId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRunning]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isRunning) return;

    const userMsg: DisplayMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsRunning(true);
    setProgressStatus('thinking');

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const conversationHistory: unknown[] = [];
      for (const m of messages) {
        if (m.rawItems) {
          conversationHistory.push(...m.rawItems);
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
        effort,
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
      };

      setMessages(prev => [...prev, assistantMsg]);

      const firstSvg = response.toolCalls?.find(tc => tc.arguments.svg)?.arguments.svg as string | undefined;
      if (firstSvg) onPreviewSvg(firstSvg);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const creditsErr = isCreditsError(err);
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
    }
  }, [input, isRunning, messages, svgCode, selectedElement, selectedLineRange, model, imageModel, effort]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    onPreviewSvg(null);
    clearChatMessages(fileId);
  }, [onPreviewSvg, fileId]);

  const handleRestore = useCallback((msgIdx: number) => {
    const removed = messages.slice(msgIdx);
    const popCount = removed.reduce((n, m) =>
      n + (m.toolCalls?.filter(tc => tc.status === 'accepted' && tc.arguments.svg).length ?? 0), 0);

    const userMsg = messages[msgIdx];
    if (userMsg?.role === 'user' && userMsg.content) {
      setInput(userMsg.content);
    }

    const kept = messages.slice(0, msgIdx);
    setMessages(kept);
    saveChatMessages(kept, fileId);

    onPreviewSvg(null);
    if (popCount > 0) onRestore(popCount);
  }, [messages, onPreviewSvg, onRestore, fileId]);

  const handleAccept = useCallback((msgIndex: number, tcIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg?.toolCalls?.[tcIndex]) return;

    const tc = msg.toolCalls[tcIndex];
    const svg = tc.arguments.svg as string;
    if (svg) onAcceptSvg(svg);
    onPreviewSvg(null);

    setMessages(prev => prev.map((m, i) =>
      i !== msgIndex ? m : {
        ...m,
        toolCalls: m.toolCalls?.map((t, j) =>
          j === tcIndex ? { ...t, status: 'accepted' as const } : t
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

  const handleReject = useCallback((msgIndex: number, tcIndex: number) => {
    onPreviewSvg(null);

    const userMsgIndex = msgIndex - 1;
    const userMsg = messages[userMsgIndex];
    const restoredText = userMsg?.role === 'user' ? userMsg.content : '';

    setMessages(prev => prev.filter((_, i) => i !== userMsgIndex && i !== msgIndex));
    setInput(restoredText);
  }, [messages, onPreviewSvg]);

  const handleModelChange = useCallback((v: string) => {
    setModel(v);
    localStorage.setItem('esvg-model', v);
  }, []);

  const handleImageModelChange = useCallback((v: string) => {
    setImageModel(v);
    localStorage.setItem('esvg-image-model', v);
  }, []);

  return (
    <div className="aui-root">
      <div className="aui-header">
        <Tooltip label="Clear Chat">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleNewChat} disabled={isRunning || hasPending || messages.length === 0}>
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
          viewportRef={viewportRef}
          endRef={endRef}
          onAccept={handleAccept}
          onReject={handleReject}
          onUpdateToolCallSvg={handleUpdateToolCallSvg}
          onRestore={handleRestore}
        />
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
          isAnonymous={isAnonymous}
          isModelDisabled={isModelDisabled}
        />
      </div>
    </div>
  );
}
