import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, ActionIcon, Tooltip, Select } from '@mantine/core';
import { IconSparkles, IconUser, IconCode, IconCheck, IconX, IconPencil, IconPlus, IconTrash, IconArrowUp, IconPlayerStop } from '@tabler/icons-react';
import { sendChatRequest, type ChatMessage, type ChatToolCall, type ProgressStatus } from '../lib/api-client';
import { loadChatMessages, saveChatMessages, clearChatMessages } from '../lib/chat-storage';
import './AiChat.css';

interface StoredToolCall extends ChatToolCall {
  status: 'pending' | 'accepted' | 'rejected';
}

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: StoredToolCall[];
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

const MODELS = [
  { label: 'GPT-4.1 mini', value: 'gpt-4.1-mini' },
  { label: 'GPT-4.1 nano', value: 'gpt-4.1-nano' },
  { label: 'GPT-5 mini', value: 'gpt-5-mini' },
  { label: 'GPT-5 nano', value: 'gpt-5-nano' },
  { label: 'GPT-5.4 mini', value: 'gpt-5.4-mini' },
  { label: 'GPT-5.4 nano', value: 'gpt-5.4-nano' },
];

export function AiChat({ svgCode, fileId, selectedElement, selectedLineRange, onPreviewSvg, onAcceptSvg, onRestore, canUndo }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('thinking');
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [model, setModel] = useState(() => localStorage.getItem('esvg-model') || 'gpt-5.4-mini');
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
      const apiMessages: ChatMessage[] = newMessages.map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatRequest(
        apiMessages,
        svgCode,
        selectedElement,
        selectedLineRange,
        model,
        abort.signal,
        setProgressStatus,
      );

      setUsage(response.usage);

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
      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: `Error: ${(err as Error).message}`,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [input, isRunning, messages, svgCode, selectedElement, selectedLineRange, model]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setUsage(null);
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
              return msg.toolCalls.map((tc, tcIdx) => (
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
              ));
            }

            return (<>
            {showCheckpoint && canUndo && (
              <div key={`cp-${msgIdx}`} className="aui-checkpoint">
                <div className="aui-checkpoint-line" />
                <button className="aui-checkpoint-restore" onClick={() => handleRestore(msgIdx)}>Restore</button>
                <div className="aui-checkpoint-line" />
              </div>
            )}
            <div key={msgIdx} className={`aui-msg ${msg.role === 'user' ? 'aui-msg-user' : 'aui-msg-assistant'}`}>
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
            </div>
            </>);
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
            <Select
              size="xs"
              variant="unstyled"
              value={model}
              onChange={v => {
                if (v) {
                  setModel(v);
                  localStorage.setItem('esvg-model', v);
                }
              }}
              data={MODELS}
              allowDeselect={false}
              comboboxProps={{ withinPortal: false }}
            />
            <div className="aui-composer-footer-actions">
              {usage && (
                <span className="aui-usage">{usage.used}/{usage.limit}</span>
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
