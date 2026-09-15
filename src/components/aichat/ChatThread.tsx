import { useState, Fragment, useRef, useEffect, useLayoutEffect, useSyncExternalStore, memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ActionIcon, Tooltip, Button, Group, Text } from '@mantine/core';
import { IconSparkles, IconUser, IconChevronRight, IconChevronDown, IconTool, IconX, IconArrowUp, IconThumbUp, IconThumbDown, IconBulb } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { sanitizeSvg } from '../../lib/sanitize';
import { ToolCallProposal } from '../ToolCallProposal';
import { BUY_CREDITS_URL } from '../CreditsIndicator';
import { buildCheckoutUrl, type PpgProductKey } from '../../lib/ppg-checkout';
import { DEFAULT_PRICING } from '../../lib/pricing';
import { trackBeginCheckout } from '../../lib/analytics';

import { IconPicker } from './IconPicker';
import { ImageConfirm } from './ImageConfirm';
import type { DisplayMessage, ProgressStatus } from './types';
import type { IconResult, ReadToolCall } from '../../lib/api-client';
import type { LiveReplyStore } from '../../lib/live-reply';

interface ChatThreadProps {
  messages: DisplayMessage[];
  isRunning: boolean;
  progressStatus: ProgressStatus;
  /** The reply the current call is streaming. Read by the live bubble alone. */
  live: LiveReplyStore;
  /** The live bubble changed size, so the end of the thread may need following. */
  onLiveGrow?: () => void;
  canUndo: boolean;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onAccept: (msgIndex: number, tcIndex: number) => void;
  onReject: (msgIndex: number, tcIndex: number) => void;
  onUpdateToolCallSvg: (msgIndex: number, tcIndex: number, newSvg: string) => void;
  onUndoAccept: (msgIndex: number, tcIndex: number) => void;
  onRestore: (msgIdx: number) => void;
  onThumbsUp: (msgIndex: number) => void;
  onThumbsDown: (msgIndex: number, prompt: string) => void;
  /** Resume a turn that stopped on its tool-call limit. */
  onContinue: () => void;
  /** A proposal is awaiting accept/reject, which blocks sending anything. */
  hasPending: boolean;
  editingIndex: number | null;
  editingText: string;
  onEditStart: (msgIdx: number) => void;
  onEditChange: (text: string) => void;
  onEditSubmit: (msgIdx: number, text: string) => void;
  onEditCancel: () => void;
  iconPickIcons: IconResult[] | null;
  iconPickSelected: IconResult | null;
  onIconSelect: (icon: IconResult) => void;
  onIconMore: () => void;
  onIconNone: () => void;
  imageConfirmSummary: string | null;
  onImageConfirm: () => void;
  onImageDecline: () => void;
  onSamplePrompt: (text: string) => void;
  isAnonymous: boolean;
  /** Somebody else's document — no composer, so nothing to prompt into. */
  isViewer: boolean;
}

/** Open PayPro checkout for the given product. Only reachable by signed-in users (AI requires sign-in). */
function startCheckout(product: PpgProductKey) {
  const user = getAuth().currentUser;
  trackBeginCheckout(product);
  window.open(buildCheckoutUrl(product, { uid: user?.uid, email: user?.email, displayName: user?.displayName }), '_blank');
}

/** A toggle that shows what sits behind a turn when opened — its tool calls, or its
 *  reasoning. One shell, so a change to how it opens reaches both. */
function Collapsible({ icon, label, children }: { icon: React.ReactNode; label: React.ReactNode; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="aui-read-tools">
      <button className="aui-read-tools-toggle" aria-expanded={expanded} onClick={() => setExpanded(e => !e)}>
        {expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
        {icon}
        <span>{label}</span>
      </button>
      {expanded && children}
    </div>
  );
}

/** A finished turn's reasoning, collapsed: it explains how the answer came about, and is
 *  secondary to the answer itself. */
function ReasoningBlock({ text }: { text: string }) {
  return (
    <Collapsible icon={<IconBulb size={12} />} label="Reasoning">
      <div className="aui-reasoning aui-thought">
        <Markdown>{text}</Markdown>
      </div>
    </Collapsible>
  );
}

function ReadToolCallsBlock({ calls }: { calls: ReadToolCall[] }) {
  const summary = calls.map(tc => tc.name).join(', ');
  return (
    <Collapsible icon={<IconTool size={12} />} label={`${calls.length} tool call${calls.length > 1 ? 's' : ''}: ${summary}`}>
      <div className="aui-read-tools-details">
        {calls.map((tc, i) => (
          <div key={i} className="aui-read-tool-item">
            <div className="aui-read-tool-name">{tc.name}({Object.entries(tc.args).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')})</div>
            <pre className="aui-read-tool-result">{tc.result}</pre>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}

function EditMessageForm({ text, onChange, onSubmit, onCancel }: {
  text: string;
  onChange: (t: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="aui-edit-form">
      <textarea
        ref={textareaRef}
        className="aui-edit-textarea"
        value={text}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <div className="aui-edit-actions">
        <Tooltip label="Cancel (Esc)">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={onCancel}>
            <IconX size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Submit (Enter)">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={onSubmit} disabled={!text.trim()}>
            <IconArrowUp size={16} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * Assistant text, rendered as markdown. Models emit it whether or not they are asked to,
 * so answers were showing literal asterisks and pipe tables — the `aui-markdown` class
 * has always been a promise this now keeps.
 *
 * Raw HTML stays off (react-markdown's default), so nothing a model writes can inject
 * markup; links open in a new tab rather than replacing the editor.
 *
 * Memoized, with its plugins and components hoisted. react-markdown parses afresh on every
 * render, and the thread re-renders throughout a turn — the elapsed-seconds tick, each status
 * change — so every earlier answer was parsed again each time, and fresh component functions
 * remounted every link and table with it.
 */
const REMARK_PLUGINS = [remarkGfm];
const MARKDOWN_COMPONENTS: Components = {
  a: ({ ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
  // Wide tables scroll inside the message rather than stretching the panel.
  table: ({ ...props }) => (
    <div className="aui-table-scroll">
      <table {...props} />
    </div>
  ),
};

const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <div className="aui-markdown">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={MARKDOWN_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
});

/** The paragraph of a reasoning summary the model is on now. Summaries arrive as short
 *  paragraphs and the latest says what is happening; the whole history would push the
 *  conversation out of view. */
function latestReasoning(summary: string): string {
  const parts = summary.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

/**
 * The reply a call is streaming: the answer so far, or — until answer text arrives — the
 * paragraph of reasoning the model is on. It reads the live store itself, so a delta
 * re-renders this and nothing else in the panel, and it reports each change so the thread
 * can keep its end in view.
 */
function LiveReply({ live, onGrow }: { live: LiveReplyStore; onGrow?: () => void }) {
  const { text, reasoning } = useSyncExternalStore(live.subscribe, live.getSnapshot);
  const reasoningNow = latestReasoning(reasoning);
  useLayoutEffect(() => {
    onGrow?.();
  }, [text, reasoningNow, onGrow]);
  if (text) return <Markdown>{text}</Markdown>;
  if (!reasoningNow) return null;
  return (
    <div className="aui-live-reasoning aui-thought">
      <Markdown>{reasoningNow}</Markdown>
    </div>
  );
}

const SAMPLE_PROMPTS = [
  'Draw me a cute kitten',
  'Change color of all boxes to red',
  'Add a blue sky background',
  'Translate all text to German',
];

export function ChatThread({
  messages, isRunning, progressStatus, live, onLiveGrow, canUndo,
  viewportRef,
  onAccept, onReject, onUpdateToolCallSvg, onUndoAccept, onRestore,
  onThumbsUp, onThumbsDown, onContinue, hasPending,
  editingIndex, editingText, onEditStart, onEditChange, onEditSubmit, onEditCancel,
  iconPickIcons, iconPickSelected, onIconSelect, onIconMore, onIconNone,
  imageConfirmSummary, onImageConfirm, onImageDecline,
  onSamplePrompt, isAnonymous, isViewer,
}: ChatThreadProps) {
  const progressLabel = typeof progressStatus === 'string' ? progressStatus : progressStatus.tool;

  // Thumbs feedback state: which message index has been rated, and whether the share prompt is showing
  const [ratedMsgs, setRatedMsgs] = useState<Record<number, 'up' | 'down'>>({}); 
  const [sharePromptIdx, setSharePromptIdx] = useState<number | null>(null);

  // Reset ratings when messages change (e.g. re-run)
  const msgLen = messages.length;
  useEffect(() => {
    setRatedMsgs({});
    setSharePromptIdx(null);
  }, [msgLen]);

  // Elapsed seconds since the request started — reassures the user the system is alive
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isRunning) {
      startedAtRef.current = null;
      setElapsed(0);
      return;
    }
    startedAtRef.current = Date.now();
    setElapsed(0);
    const id = window.setInterval(() => {
      if (startedAtRef.current) {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [isRunning]);

  return (
    <div className="aui-viewport" ref={viewportRef}>
      {messages.length === 0 && (
        isViewer ? (
          <div className="aui-empty">
            <IconSparkles size={32} className="aui-empty-icon" />
            <p>This document has no AI conversation</p>
            <p className="aui-empty-hint">Make a copy to start your own.</p>
          </div>
        ) : (
          <div className="aui-empty">
            <IconSparkles size={32} className="aui-empty-icon" />
            <p>Ask AI to edit your SVG</p>
            <div className="aui-sample-prompts">
              {SAMPLE_PROMPTS.map(prompt => (
                <button key={prompt} className="aui-sample-prompt" onClick={() => onSamplePrompt(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            {isAnonymous && (
              <p className="aui-empty-signin">Sign-in required to send — free, includes {DEFAULT_PRICING.freeMonthlyCredits} AI credits/month</p>
            )}
          </div>
        )
      )}

      {messages.map((msg, msgIdx) => {
        if (msg.role === 'user') {
          const isEditing = editingIndex === msgIdx;
          // A viewer is reading somebody else's conversation: no rewriting it
          // (edit-and-resubmit) and no rolling their document back to it.
          const editable = !isEditing && !isRunning && !isViewer;
          return (<Fragment key={msgIdx}>
            {canUndo && !isViewer && (
              <div className="aui-checkpoint">
                <div className="aui-checkpoint-line" />
                <button className="aui-checkpoint-restore" onClick={() => onRestore(msgIdx)}>Restore</button>
                <div className="aui-checkpoint-line" />
              </div>
            )}
            <div className={`aui-msg aui-msg-user${editable ? ' aui-msg-editable' : ''}`}
              onClick={editable ? () => onEditStart(msgIdx) : undefined}
            >
              <div className="aui-msg-header">
                <IconUser size={14} />
                You
              </div>
              {isEditing ? (
                <EditMessageForm
                  text={editingText}
                  onChange={onEditChange}
                  onSubmit={() => onEditSubmit(msgIdx, editingText)}
                  onCancel={onEditCancel}
                />
              ) : (
                <div className="aui-markdown" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              )}
            </div>
          </Fragment>);
        }

        // Assistant message
        const hasAcceptedGenImage = !isViewer
          && msg.toolCalls?.some(tc => (tc.name === 'generate_image' || tc.name === 'modify_image') && tc.status === 'accepted');

        if (msg.toolCalls?.length && !msg.content && !msg.readToolCalls?.length && !msg.selectedIcon && !msg.outOfToolRounds) {
          const rated = ratedMsgs[msgIdx];
          return (<div key={msgIdx} style={{ position: 'relative' }}>
            {hasAcceptedGenImage && (
              <div className="aui-checkpoint">
                <div className="aui-checkpoint-line" />
                <button className="aui-checkpoint-restore" onClick={() => {
                  const tcIdx = msg.toolCalls!.findIndex(tc => (tc.name === 'generate_image' || tc.name === 'modify_image') && tc.status === 'accepted');
                  if (tcIdx >= 0) onUndoAccept(msgIdx, tcIdx);
                }}>Restore</button>
                <div className="aui-checkpoint-line" />
              </div>
            )}
            {msg.reasoning && <ReasoningBlock text={msg.reasoning} />}
            {msg.toolCalls.map((tc, tcIdx) => (
              <ToolCallProposal
                key={`${msgIdx}-${tcIdx}`}
                tc={tc}
                onAccept={() => onAccept(msgIdx, tcIdx)}
                onReject={() => onReject(msgIdx, tcIdx)}
                onUpdateSvg={(svg) => onUpdateToolCallSvg(msgIdx, tcIdx, svg)}
              />
            ))}
            {!isRunning && !isViewer && (
              <div className="aui-thumbs">
                {sharePromptIdx === msgIdx ? (
                  <div className="aui-share-prompt">
                    <span>Share this chat and drawing to help us improve?</span>
                    <button className="aui-action-btn aui-action-btn-primary" onClick={() => {
                      const userMsg = messages[msgIdx - 1];
                      onThumbsDown(msgIdx, userMsg?.role === 'user' ? userMsg.content : '');
                      setSharePromptIdx(null);
                    }}>Share</button>
                    <button className="aui-action-btn" onClick={() => {
                      onThumbsDown(msgIdx, '');
                      setSharePromptIdx(null);
                    }}>Skip</button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`aui-thumb-btn${rated === 'up' ? ' active' : ''}`}
                      title="Good response"
                      disabled={!!rated}
                      onClick={() => { setRatedMsgs(p => ({ ...p, [msgIdx]: 'up' })); onThumbsUp(msgIdx); }}
                    ><IconThumbUp size={16} /></button>
                    <button
                      className={`aui-thumb-btn${rated === 'down' ? ' active' : ''}`}
                      title="Bad response"
                      disabled={!!rated}
                      onClick={() => { setRatedMsgs(p => ({ ...p, [msgIdx]: 'down' })); setSharePromptIdx(msgIdx); }}
                    ><IconThumbDown size={16} /></button>
                  </>
                )}
              </div>
            )}
          </div>);
        }

        const rated = ratedMsgs[msgIdx];

        return (
          <div key={msgIdx} className="aui-msg aui-msg-assistant">
            {msg.reasoning && <ReasoningBlock text={msg.reasoning} />}
            {msg.readToolCalls && msg.readToolCalls.length > 0 && (
              <ReadToolCallsBlock calls={msg.readToolCalls} />
            )}
            {msg.selectedIcon && (
              <div className="aui-icon-picker aui-icon-picker-collapsed">
                <span className="aui-icon-picker-label">Icon:</span>
                <div className="aui-icon-picker-selected">
                  <div className="aui-icon-picker-svg" dangerouslySetInnerHTML={{ __html: sanitizeSvg(msg.selectedIcon.svg) }} />
                  <span className="aui-icon-picker-selected-name">{msg.selectedIcon.name}</span>
                </div>
              </div>
            )}
            {msg.content && <Markdown>{msg.content}</Markdown>}
            {msg.outOfToolRounds && (
              <div className="aui-markdown" style={{ whiteSpace: 'pre-wrap' }}>
                {/* Not "the edit was never made": the response that ran out of
                    rounds can still carry an edit, and that proposal renders
                    directly below this notice. Says only what is true either
                    way — it stopped early, and there is more to do. */}
                <Text size="sm" c="dimmed">This turn ran out of tool calls before it finished. Continue to pick up where it stopped.</Text>
                {/* Continue goes through the same send path as a message, which
                    refuses to start while a proposal is unanswered. Left enabled,
                    the button did nothing at all and said nothing about why. */}
                <Button size="xs" variant="default" mt="xs" disabled={isRunning || isViewer || hasPending} onClick={onContinue}>Continue</Button>
                {hasPending && <Text size="xs" c="dimmed" mt={4}>Accept or reject the proposed edits first.</Text>}
              </div>
            )}
            {msg.buyCredits && (
              <Group gap="xs" mt="xs">
                <Button size="xs" variant="default" onClick={() => startCheckout('credits-100')}>100 credits — $5</Button>
                <Button size="xs" variant="filled" onClick={() => startCheckout('pro-monthly')}>Go Pro — $10/mo</Button>
                <Button size="xs" variant="subtle" component={Link} to={BUY_CREDITS_URL}>Compare plans</Button>
              </Group>
            )}
            {hasAcceptedGenImage && (
              <div className="aui-checkpoint">
                <div className="aui-checkpoint-line" />
                <button className="aui-checkpoint-restore" onClick={() => {
                  const tcIdx = msg.toolCalls!.findIndex(tc => (tc.name === 'generate_image' || tc.name === 'modify_image') && tc.status === 'accepted');
                  if (tcIdx >= 0) onUndoAccept(msgIdx, tcIdx);
                }}>Restore</button>
                <div className="aui-checkpoint-line" />
              </div>
            )}
            {msg.toolCalls?.map((tc, tcIdx) => (
              <ToolCallProposal
                key={tcIdx}
                tc={tc}
                onAccept={() => onAccept(msgIdx, tcIdx)}
                onReject={() => onReject(msgIdx, tcIdx)}
                onUpdateSvg={(svg) => onUpdateToolCallSvg(msgIdx, tcIdx, svg)}
              />
            ))}
            {!isRunning && !isViewer && (msg.content || msg.toolCalls?.length) && (
              <div className="aui-thumbs">
                {sharePromptIdx === msgIdx ? (
                  <div className="aui-share-prompt">
                    <span>Share this chat and drawing to help us improve?</span>
                    <button className="aui-action-btn aui-action-btn-primary" onClick={() => {
                      const userMsg = messages[msgIdx - 1];
                      onThumbsDown(msgIdx, userMsg?.role === 'user' ? userMsg.content : '');
                      setSharePromptIdx(null);
                    }}>Share</button>
                    <button className="aui-action-btn" onClick={() => {
                      onThumbsDown(msgIdx, '');
                      setSharePromptIdx(null);
                    }}>Skip</button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`aui-thumb-btn${rated === 'up' ? ' active' : ''}`}
                      title="Good response"
                      disabled={!!rated}
                      onClick={() => { setRatedMsgs(p => ({ ...p, [msgIdx]: 'up' })); onThumbsUp(msgIdx); }}
                    ><IconThumbUp size={16} /></button>
                    <button
                      className={`aui-thumb-btn${rated === 'down' ? ' active' : ''}`}
                      title="Bad response"
                      disabled={!!rated}
                      onClick={() => { setRatedMsgs(p => ({ ...p, [msgIdx]: 'down' })); setSharePromptIdx(msgIdx); }}
                    ><IconThumbDown size={16} /></button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {iconPickIcons && (
        <div className="aui-msg aui-msg-assistant">
          <IconPicker icons={iconPickIcons} onSelect={onIconSelect} onMore={onIconMore} onNone={onIconNone} selectedIcon={iconPickSelected} />
        </div>
      )}

      {imageConfirmSummary && (
        <div className="aui-msg aui-msg-assistant">
          <ImageConfirm summary={imageConfirmSummary} onConfirm={onImageConfirm} onDecline={onImageDecline} />
        </div>
      )}

      {isRunning && (!iconPickIcons || iconPickSelected) && !imageConfirmSummary && (
        <div className="aui-msg aui-msg-assistant">
          <LiveReply live={live} onGrow={onLiveGrow} />
          <div className="aui-status-indicator">
            <span className="aui-spinner" />
            {progressLabel === 'thinking' && 'Thinking…'}
            {progressLabel === 'generating-image' && (
              <span>
                Generating image… <span className="aui-status-hint">this usually takes 30–60s</span>
              </span>
            )}
            {progressLabel === 'modifying-image' && (
              <span>
                Modifying image… <span className="aui-status-hint">this usually takes 30–60s</span>
              </span>
            )}
            {progressLabel === 'vectorizing' && 'Vectorizing…'}
            {typeof progressStatus === 'object' && `Calling ${progressStatus.tool}… (round ${progressStatus.round})`}
            {elapsed > 1 && <span className="aui-status-elapsed"> · {elapsed}s</span>}
          </div>
        </div>
      )}

    </div>
  );
}
