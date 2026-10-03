import { useRef, useCallback, useState } from 'react';
import { Badge, ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowUp, IconPlayerStop, IconAlertTriangle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { CreditsIndicator, BUY_CREDITS_URL } from '../CreditsIndicator';
import { ModelPicker } from './ModelPicker';
import type { Credits, ReasoningEffort } from './types';

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isRunning: boolean;
  hasPending: boolean;
  selectedElement?: string;
  /**
   * The address the model will be given for this selection — the same string
   * buildSvgContext puts in the context, so the badge and the request cannot
   * disagree about which element is meant. Null when none could be derived
   * (a document mid-edit does not parse), and then the open tag is shown.
   */
  selectedAddress?: string | null;
  model: string;
  onModelChange: (value: string) => void;
  imageModel: string;
  onImageModelChange: (value: string) => void;
  effort: ReasoningEffort | undefined;
  supportedEfforts: ReasoningEffort[] | undefined;
  onEffortChange: (value: ReasoningEffort) => void;
  credits: Credits | null;
  isModelDisabled: (m: { pro: boolean }) => boolean;
  /** Past user messages for Up/Down history navigation. */
  history: string[];
  /** Filled with the composer's textarea, so the panel can hand it the caret. */
  inputRef?: { current: HTMLTextAreaElement | null };
}

export function ChatComposer({
  input, onInputChange, onSend, onStop,
  isRunning, hasPending, selectedElement, selectedAddress,
  model, onModelChange, imageModel, onImageModelChange,
  effort, supportedEfforts, onEffortChange,
  credits, isModelDisabled, history, inputRef,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // One element, two holders: this component sizes it, and the panel focuses it.
  const setTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    if (inputRef) inputRef.current = el;
  }, [inputRef]);
  // History navigation: -1 = current input, 0 = most recent, 1 = one before, etc.
  const [historyIdx, setHistoryIdx] = useState(-1);
  const draftRef = useRef('');  // saves current input when navigating into history

  const autoGrow = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0';
    const maxH = 200;
    const desired = Math.max(60, ta.scrollHeight + 2);
    ta.style.height = Math.min(maxH, desired) + 'px';
    ta.style.overflowY = desired > maxH ? 'auto' : 'hidden';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setHistoryIdx(-1);
      onSend();
      return;
    }

    const ta = e.currentTarget;

    if (e.key === 'ArrowUp' && history.length > 0) {
      // Only navigate history when cursor is at the very start
      if (ta.selectionStart !== 0) return;

      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) return; // no more history

      e.preventDefault();
      if (historyIdx === -1) {
        draftRef.current = input; // save current draft
      }
      setHistoryIdx(nextIdx);
      onInputChange(history[nextIdx]);
      requestAnimationFrame(autoGrow);
      return;
    }

    if (e.key === 'ArrowDown' && historyIdx >= 0) {
      // Only navigate history when cursor is at the very end
      if (ta.selectionStart !== ta.value.length) return;

      e.preventDefault();
      const nextIdx = historyIdx - 1;
      if (nextIdx < 0) {
        setHistoryIdx(-1);
        onInputChange(draftRef.current);
      } else {
        setHistoryIdx(nextIdx);
        onInputChange(history[nextIdx]);
      }
      requestAnimationFrame(autoGrow);
      return;
    }
  }, [onSend, history, historyIdx, input, onInputChange, autoGrow]);

  const LOW_CREDITS_THRESHOLD = 5;
  const showLowCredits = credits && credits.remaining > 0 && credits.remaining <= LOW_CREDITS_THRESHOLD;

  return (
    <div className="aui-composer-area">
      {showLowCredits && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', marginBottom: 4, borderRadius: 4, background: 'var(--mantine-color-yellow-light)', fontSize: 12 }}>
          <IconAlertTriangle size={14} color="var(--mantine-color-yellow-filled)" />
          <span>Only {credits.remaining} credit{credits.remaining !== 1 ? 's' : ''} left — <Link to={BUY_CREDITS_URL} style={{ fontWeight: 600 }}>upgrade</Link></span>
        </div>
      )}
      {selectedElement && (
        <div style={{ marginBottom: 4 }}>
          <Badge data-testid="selection-address" size="xs" variant="light" color="violet" style={{ maxWidth: '100%', textTransform: 'none' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(() => {
                // The address, when there is one: it is what the request will
                // actually be aimed at. The open tag was showing whichever
                // attribute came first in source order, which on a traced
                // drawing is the path data — so every selected <path> read
                // "<path d="M0 0 C5 3 9 7 14 10 C14 10 …>" and told you nothing.
                if (selectedAddress) return selectedAddress;
                const maxLen = 60;
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
          ref={setTextarea}
          className="aui-composer-input"
          placeholder="Ask AI to edit your SVG…"
          value={input}
          onChange={e => {
            onInputChange(e.target.value);
            requestAnimationFrame(autoGrow);
          }}
          onKeyDown={handleKeyDown}
          disabled={isRunning || hasPending}
        />
      </div>
      <div className="aui-composer-footer">
        <ModelPicker
          model={model}
          onModelChange={onModelChange}
          imageModel={imageModel}
          onImageModelChange={onImageModelChange}
          effort={effort}
          supportedEfforts={supportedEfforts}
          onEffortChange={onEffortChange}
          isModelDisabled={isModelDisabled}
        />
        <div className="aui-composer-footer-actions">
          {credits && (
            <CreditsIndicator remaining={credits.remaining} limit={credits.limit} packCredits={credits.packCredits} creditsByModel={credits.creditsByModel} rechargeAt={credits.rechargeAt} />
          )}
          <Tooltip label={isRunning ? 'Stop' : 'Send (Enter)'}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={isRunning ? onStop : onSend}
              disabled={!isRunning && (!input.trim() || hasPending)}
              aria-label={isRunning ? 'Stop' : 'Send'}
            >
              {isRunning ? <IconPlayerStop size={16} /> : <IconArrowUp size={16} />}
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
