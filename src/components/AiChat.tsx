import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { Badge, ActionIcon, Tooltip, Popover, Radio, Text, Stack, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSparkles, IconUser, IconCode, IconCheck, IconX, IconPencil, IconPlus, IconTrash, IconArrowUp, IconPlayerStop } from '@tabler/icons-react';
import { sendChatRequest, fetchCredits, type ChatMessage, type ChatToolCall, type ProgressStatus, type TokenUsage, type Credits } from '../lib/api-client';
import { computeChatCost, computeImageCost, formatCost, formatTokens } from '../lib/pricing';
import { loadChatMessages, saveChatMessages, clearChatMessages } from '../lib/chat-storage';
import './AiChat.css';

interface StoredToolCall extends ChatToolCall {
  status: 'pending' | 'accepted' | 'rejected';
}

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: StoredToolCall[];
  tokens?: TokenUsage[];
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

const EDIT_MODELS = [
  { label: 'gpt-4o-mini (1x)', value: 'gpt-4o-mini', pro: false },
  { label: 'gpt-4.1-mini (1x)', value: 'gpt-4.1-mini', pro: false },
  { label: 'gpt-5-mini (3x)', value: 'gpt-5-mini', pro: false },
  { label: 'gpt-5.1-codex-mini (3x)', value: 'gpt-5.1-codex-mini', pro: false },
  { label: 'gpt-5.4-mini (3x)', value: 'gpt-5.4-mini', pro: false },
  { label: 'gpt-4.1 (5x)', value: 'gpt-4.1', pro: true },
  { label: 'gpt-5 (15x)', value: 'gpt-5', pro: true },
  { label: 'gpt-5.1 (15x)', value: 'gpt-5.1', pro: true },
  { label: 'gpt-5.1-codex (15x)', value: 'gpt-5.1-codex', pro: true },
  { label: 'gpt-5.2 (20x)', value: 'gpt-5.2', pro: true },
  { label: 'gpt-5.2-codex (20x)', value: 'gpt-5.2-codex', pro: true },
  { label: 'gpt-5.4 (20x)', value: 'gpt-5.4', pro: true },
];

const IMAGE_MODELS = [
  { label: 'gpt-image-1-mini (10x)', value: 'gpt-image-1-mini', pro: false },
  { label: 'gpt-image-1.5 (30x)', value: 'gpt-image-1.5', pro: true },
  { label: 'gpt-image-1 (50x)', value: 'gpt-image-1', pro: true },
];

function shortModelName(value: string): string {
  return value.replace('gpt-', '').replace('image-', 'img');
}

function CreditsIndicator({ remaining, limit }: { remaining: number; limit: number }) {
  const size = 18;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(remaining / limit, 1);
  const offset = circumference * (1 - ratio);
  const color = ratio <= 0 ? 'var(--mantine-color-red-filled)' : ratio <= 0.2 ? 'var(--mantine-color-yellow-filled)' : 'var(--mantine-primary-color-filled)';
  const label = `${remaining} / ${limit} credits remaining`;
  return (
    <Tooltip label={label}>
      <svg width={size} height={size} style={{ display: 'block', cursor: 'default' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mantine-color-default-border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
    </Tooltip>
  );
}

function TokenInfo({ tokens }: { tokens: TokenUsage[] }) {
  const totalCost = tokens.reduce((sum, t) => {
    const isImage = t.model.startsWith('gpt-image');
    return sum + (isImage ? computeImageCost(t) : computeChatCost(t));
  }, 0);
  const totalInput = tokens.reduce((s, t) => s + t.inputTokens, 0);
  const totalOutput = tokens.reduce((s, t) => s + t.outputTokens, 0);
  const totalCached = tokens.reduce((s, t) => s + t.cachedTokens, 0);
  const models = [...new Set(tokens.map(t => t.model))];

  return (
    <div className="aui-token-info">
      <span>{models.join(', ')}</span>
      <span>↓{formatTokens(totalInput)}{totalCached > 0 && ` (${formatTokens(totalCached)} cached)`}</span>
      <span>↑{formatTokens(totalOutput)}</span>
      <span>{formatCost(totalCost)}</span>
    </div>
  );
}

export function AiChat({ svgCode, fileId, selectedElement, selectedLineRange, onPreviewSvg, onAcceptSvg, onRestore, canUndo }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('thinking');
  const [credits, setCredits] = useState<Credits | null>(null);
  const [model, setModel] = useState(() => localStorage.getItem('esvg-model') || 'gpt-5.4-mini');
  const [imageModel, setImageModel] = useState(() => localStorage.getItem('esvg-image-model') || 'gpt-image-1-mini');
  const [modelPickerOpened, modelPicker] = useDisclosure(false);
  const tier = credits?.tier ?? 'free';
  const editModels = useMemo(() => EDIT_MODELS.filter(m => tier === 'pro' || !m.pro), [tier]);
  const imageModels = useMemo(() => IMAGE_MODELS.filter(m => tier === 'pro' || !m.pro), [tier]);
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

  // Load messages from IndexedDB on mount
  useEffect(() => {
    loadChatMessages<DisplayMessage>(fileId).then((stored) => {
      if (stored.length > 0) {
        setMessages(stored);
      }
      loadedRef.current = true;
    });
    // Fetch current credit balance
    fetchCredits().then((data) => {
      if (data) setCredits(data);
    });
  }, []);

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
        tokens: response.tokens.length > 0 ? response.tokens : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto-show preview for the first tool call with SVG
      const firstSvg = response.toolCalls?.find(tc => tc.arguments.svg)?.arguments.svg as string | undefined;
      if (firstSvg) onPreviewSvg(firstSvg);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: `Error: ${(err as Error).message}`,
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
    setCredits(null);
    onPreviewSvg(null);
    clearChatMessages(fileId);
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
              <p className="aui-empty-hint">e.g. &quot;Change the fill to blue&quot;</p>
            </div>
          )}

          {messages.map((msg, msgIdx) => {
            // Show checkpoint divider before every user message
            const showCheckpoint = msg.role === 'user';

            // Assistant messages with only tool calls: render proposals directly without double-wrapping
            if (msg.role === 'assistant' && msg.toolCalls?.length && !msg.content) {
              return (<div key={msgIdx}>
                {msg.toolCalls.map((tc, tcIdx) => (
                <div key={`${msgIdx}-${tcIdx}`} className="aui-proposal" style={{ marginBottom: 8 }}>
                  <div className="aui-proposal-header">
                    {tc.name === 'edit_svg' ? <IconPencil size={14} /> : <IconCode size={14} />}
                    <span className="aui-proposal-summary">
                      {(tc.arguments.summary as string) || (tc.name === 'edit_svg' ? 'Edit SVG' : 'Replace SVG')}
                    </span>
                  </div>
                  {tc.status === 'pending' && (
                    <div className="aui-proposal-actions">
                      <button
                        className="aui-composer-send"
                        style={{ fontSize: 11, padding: '3px 10px', height: 26 }}
                        onClick={() => handleAccept(msgIdx, tcIdx)}
                      >
                        Accept
                      </button>
                      <button
                        className="aui-composer-send"
                        style={{ fontSize: 11, padding: '3px 10px', height: 26, backgroundColor: 'var(--mantine-color-dark-4)' }}
                        onClick={() => handleReject(msgIdx, tcIdx)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {tc.status === 'accepted' && (
                    <div className="aui-proposal-status aui-status-accepted">
                      <IconCheck size={12} />&nbsp;Accepted
                    </div>
                  )}
                  {tc.status === 'rejected' && (
                    <div className="aui-proposal-status aui-status-rejected">
                      <IconX size={12} />&nbsp;Dismissed
                    </div>
                  )}
                  {'failedOperations' in tc.arguments && (
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--mantine-color-red-filled)' }}>
                      ⚠ Some edits failed: {JSON.stringify(tc.arguments.failedOperations)}
                    </div>
                  )}
                </div>
              ))}
              {msg.tokens && <TokenInfo tokens={msg.tokens} />}
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
                </div>
              )}
              {msg.toolCalls?.map((tc, tcIdx) => (
                <div key={tcIdx} className="aui-proposal">
                  <div className="aui-proposal-header">
                    {tc.name === 'edit_svg' ? <IconPencil size={14} /> : <IconCode size={14} />}
                    <span className="aui-proposal-summary">
                      {(tc.arguments.summary as string) || (tc.name === 'edit_svg' ? 'Edit SVG' : 'Replace SVG')}
                    </span>
                  </div>
                  {tc.status === 'pending' && (
                    <div className="aui-proposal-actions">
                      <button
                        className="aui-composer-send"
                        style={{ fontSize: 11, padding: '3px 10px', height: 26 }}
                        onClick={() => handleAccept(msgIdx, tcIdx)}
                      >
                        Accept
                      </button>
                      <button
                        className="aui-composer-send"
                        style={{ fontSize: 11, padding: '3px 10px', height: 26, backgroundColor: 'var(--mantine-color-dark-4)' }}
                        onClick={() => handleReject(msgIdx, tcIdx)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {tc.status === 'accepted' && (
                    <div className="aui-proposal-status aui-status-accepted">
                      <IconCheck size={12} />&nbsp;Accepted
                    </div>
                  )}
                  {tc.status === 'rejected' && (
                    <div className="aui-proposal-status aui-status-rejected">
                      <IconX size={12} />&nbsp;Dismissed
                    </div>
                  )}
                  {'failedOperations' in tc.arguments && (
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--mantine-color-red-filled)' }}>
                      ⚠ Some edits failed: {JSON.stringify(tc.arguments.failedOperations)}
                    </div>
                  )}
                </div>
              ))}
              {msg.tokens && <TokenInfo tokens={msg.tokens} />}
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
            <Popover opened={modelPickerOpened} onClose={modelPicker.close} position="top-start" shadow="md" withinPortal={false}>
              <Popover.Target>
                <Text size="xs" c="dimmed" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={modelPicker.toggle}>
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
                <CreditsIndicator remaining={credits.remaining} limit={credits.limit} />
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
