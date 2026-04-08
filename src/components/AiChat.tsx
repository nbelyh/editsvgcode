import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { Badge, ActionIcon, Tooltip, Popover, Radio, Text, Stack, Group } from '@mantine/core';
import { IconSparkles, IconUser, IconPlus, IconTrash, IconArrowUp, IconPlayerStop } from '@tabler/icons-react';
import { sendChatRequest, fetchCredits, type ChatMessage, type ProgressStatus, type Credits } from '../lib/api-client';
import { loadChatMessages, saveChatMessages, clearChatMessages } from '../lib/chat-storage';
import { EDIT_MODELS, IMAGE_MODELS, shortModelName } from '../lib/models';
import { ToolCallProposal, type StoredToolCall } from './ToolCallProposal';
import { CreditsIndicator, BUY_CREDITS_URL } from './CreditsIndicator';
import './AiChat.css';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: StoredToolCall[];
  buyCredits?: true;
}

interface AiChatProps {
  svgCode: string;
  fileId: string;
  selectedElement?: string;
  selectedLineRange?: { start: number; end: number };
  onPreviewSvg: (svg: string | null) => void;
  onAcceptSvg: (svg: string) => void;
  onRestore: (popCount: number) => void;
  canUndo: boolean;
}


export function AiChat({ svgCode, fileId, selectedElement, selectedLineRange, onPreviewSvg, onAcceptSvg, onRestore, canUndo }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('thinking');
  const [credits, setCredits] = useState<Credits | null>(null);
  const [model, setModel] = useState(() => localStorage.getItem('esvg-model') || 'gpt-5.4-mini');
  const [imageModel, setImageModel] = useState(() => localStorage.getItem('esvg-image-model') || 'gpt-image-1-mini');
  const tier = credits?.tier ?? 'free';
  const isDebug = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const editModels = useMemo(() => EDIT_MODELS.filter(m => isDebug || tier === 'pro' || !m.pro), [tier, isDebug]);
  const imageModels = useMemo(() => IMAGE_MODELS.filter(m => isDebug || tier === 'pro' || !m.pro), [tier, isDebug]);
  const hasPending = messages.some(m => m.toolCalls?.some(tc => tc.status === 'pending'));
  const viewportRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadedRef = useRef(false);

  const autoGrow = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0';
    const maxH = 200;
    const desired = Math.max(60, ta.scrollHeight + 2); // +2 for borders
    ta.style.height = Math.min(maxH, desired) + 'px';
    ta.style.overflowY = desired > maxH ? 'auto' : 'hidden';
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
    // Fetch current credit balance
    fetchCredits().then((data) => {
      if (data) setCredits(data);
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
      const apiMessages: ChatMessage[] = newMessages
        .filter(m => m.role === 'user' || m.content)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatRequest(
        apiMessages,
        svgCode,
        selectedElement,
        selectedLineRange,
        model,
        imageModel,
        abort.signal,
        setProgressStatus,
      );

      setCredits(response.credits);

      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls?.map(tc => ({
          ...tc,
          status: tc.arguments.svg ? 'pending' as const : 'accepted' as const,
        })),

      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto-show preview for the first tool call with SVG
      const firstSvg = response.toolCalls?.find(tc => tc.arguments.svg)?.arguments.svg as string | undefined;
      if (firstSvg) onPreviewSvg(firstSvg);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const errMsg = (err as Error).message;
      const isCreditsError = errMsg.includes('Insufficient credits') || errMsg.includes('Pro subscription');
      // Update credits indicator from error response if available
      const errObj = err as Error & { remaining?: number; limit?: number };
      if (isCreditsError && errObj.remaining != null && errObj.limit != null) {
        setCredits({ remaining: errObj.remaining, limit: errObj.limit });
      }
      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: isCreditsError ? errMsg : `Error: ${errMsg}`,
        buyCredits: isCreditsError || undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [input, isRunning, messages, svgCode, selectedElement, selectedLineRange, model, imageModel]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    onPreviewSvg(null);
    clearChatMessages(fileId);
    fetchCredits().then((data) => { if (data) setCredits(data); });
  }, [onPreviewSvg, fileId]);

  const handleRestore = useCallback((msgIdx: number) => {
    // Count accepted tool calls in messages from msgIdx onward
    const removed = messages.slice(msgIdx);
    const popCount = removed.reduce((n, m) =>
      n + (m.toolCalls?.filter(tc => tc.status === 'accepted' && tc.arguments.svg).length ?? 0), 0);

    // Restore the user prompt to the input box
    const userMsg = messages[msgIdx];
    if (userMsg?.role === 'user' && userMsg.content) {
      setInput(userMsg.content);
    }

    // Truncate messages
    const kept = messages.slice(0, msgIdx);
    setMessages(kept);
    saveChatMessages(kept, fileId);

    onPreviewSvg(null);
    if (popCount > 0) onRestore(popCount);
  }, [messages, onPreviewSvg, onRestore, fileId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

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

    // Restore the user prompt that triggered this response
    const userMsgIndex = msgIndex - 1;
    const userMsg = messages[userMsgIndex];
    const restoredText = userMsg?.role === 'user' ? userMsg.content : '';

    // Remove the user+assistant pair
    setMessages(prev => prev.filter((_, i) => i !== userMsgIndex && i !== msgIndex));
    setInput(restoredText);
  }, [messages, onPreviewSvg]);

  return (
    <div className="aui-root">
      <div className="aui-header">
        <Tooltip label="New Chat">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleNewChat} disabled={isRunning || hasPending}>
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Clear Chat">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleNewChat} disabled={isRunning || hasPending || messages.length === 0}>
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </div>
      <div className="aui-thread">
        <div className="aui-viewport" ref={viewportRef}>
          {messages.length === 0 && (
            <div className="aui-empty">
              <IconSparkles size={32} className="aui-empty-icon" />
              <p>Ask AI to edit your SVG</p>
              <p className="aui-empty-hint">e.g. select an item and tell it to &quot;change the fill to blue&quot;</p>
            </div>
          )}

          {messages.map((msg, msgIdx) => {
            // Show checkpoint divider before every user message
            const showCheckpoint = msg.role === 'user';

            // Assistant messages with only tool calls: render proposals directly without double-wrapping
            if (msg.role === 'assistant' && msg.toolCalls?.length && !msg.content) {
              return (<div key={msgIdx}>
                {msg.toolCalls.map((tc, tcIdx) => (
                  <ToolCallProposal
                    key={`${msgIdx}-${tcIdx}`}
                    tc={tc}
                    onAccept={() => handleAccept(msgIdx, tcIdx)}
                    onReject={() => handleReject(msgIdx, tcIdx)}
                    onUpdateSvg={(svg) => handleUpdateToolCallSvg(msgIdx, tcIdx, svg)}
                  />
                ))}
              </div>);
            }

            return (<Fragment key={msgIdx}>
            {showCheckpoint && canUndo && (
              <div className="aui-checkpoint">
                <div className="aui-checkpoint-line" />
                <button className="aui-checkpoint-restore" onClick={() => handleRestore(msgIdx)}>Restore</button>
                <div className="aui-checkpoint-line" />
              </div>
            )}
            <div className={`aui-msg ${msg.role === 'user' ? 'aui-msg-user' : 'aui-msg-assistant'}`}>
              {msg.role === 'user' && (
                <div className="aui-msg-header">
                  <IconUser size={14} />
                  You
                </div>
              )}
              {msg.content && (
                <div className="aui-markdown" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                  {msg.buyCredits && (
                    <> — <a href={BUY_CREDITS_URL} target="_blank" rel="noopener noreferrer">Buy Credits</a></>
                  )}
                </div>
              )}
              {msg.toolCalls?.map((tc, tcIdx) => (
                <ToolCallProposal
                  key={tcIdx}
                  tc={tc}
                  onAccept={() => handleAccept(msgIdx, tcIdx)}
                  onReject={() => handleReject(msgIdx, tcIdx)}
                  onUpdateSvg={(svg) => handleUpdateToolCallSvg(msgIdx, tcIdx, svg)}
                />
              ))}
            </div>
            </Fragment>);
          })}

          {isRunning && (
            <div className="aui-msg aui-msg-assistant">
              <div className="aui-status-indicator">
                <span className="aui-spinner" />
                {progressStatus === 'thinking' && 'Thinking…'}
                {progressStatus === 'generating-image' && 'Generating image…'}
                {progressStatus === 'vectorizing' && 'Vectorizing…'}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="aui-composer-area">
          {selectedElement && (
            <div style={{ marginBottom: 4 }}>
              <Badge size="xs" variant="light" color="violet" style={{ maxWidth: '100%', textTransform: 'none' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(() => {
                    const maxLen = 60;
                    // Get the opening tag (up to first > or />)
                    const openTag = selectedElement.match(/^<[^>]*?\/?>/)?.[0] ?? selectedElement;
                    if (openTag.length <= maxLen) return openTag;
                    return openTag.slice(0, maxLen - 1) + '…>';
                  })()}
                </span>
              </Badge>
            </div>
          )}
          <div className="aui-composer">
            <textarea
              ref={textareaRef}
              className="aui-composer-input"
              placeholder="Ask AI to edit your SVG…"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                requestAnimationFrame(autoGrow);
              }}
              onKeyDown={handleKeyDown}
              disabled={isRunning || hasPending}
            />
          </div>
          <div className="aui-composer-footer">
            <Popover position="top-start" shadow="md">
              <Popover.Target>
                <Text size="xs" c="dimmed" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {shortModelName(model)} · {shortModelName(imageModel)}
                </Text>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="md">
                  <div>
                    <Text size="xs" fw={600} mb={4}>Edit model</Text>
                    <Radio.Group value={model} onChange={v => { setModel(v); localStorage.setItem('esvg-model', v); }}>
                      <Stack gap={4}>
                        {editModels.map(m => <Radio key={m.value} value={m.value} label={m.label} size="xs" />)}
                      </Stack>
                    </Radio.Group>
                  </div>
                  <div>
                    <Text size="xs" fw={600} mb={4}>Image model</Text>
                    <Radio.Group value={imageModel} onChange={v => { setImageModel(v); localStorage.setItem('esvg-image-model', v); }}>
                      <Stack gap={4}>
                        {imageModels.map(m => <Radio key={m.value} value={m.value} label={m.label} size="xs" />)}
                      </Stack>
                    </Radio.Group>
                  </div>
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <div className="aui-composer-footer-actions">
              {credits && (
                <CreditsIndicator remaining={credits.remaining} limit={credits.limit} creditsByModel={credits.creditsByModel} />
              )}
              <Tooltip label={isRunning ? 'Stop' : 'Send (Enter)'}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={isRunning ? handleStop : handleSend}
                  disabled={!isRunning && (!input.trim() || hasPending)}
                >
                  {isRunning ? <IconPlayerStop size={16} /> : <IconArrowUp size={16} />}
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
