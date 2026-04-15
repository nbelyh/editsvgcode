import { useRef, useCallback, useMemo, useState } from 'react';
import { Badge, ActionIcon, Tooltip, Popover, Radio, Text, Stack } from '@mantine/core';
import { IconArrowUp, IconPlayerStop } from '@tabler/icons-react';
import { EDIT_MODELS, IMAGE_MODELS, shortModelName } from '../../lib/models';
import { CreditsIndicator, BUY_CREDITS_URL } from '../CreditsIndicator';
import type { Credits, ReasoningEffort } from './types';

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isRunning: boolean;
  hasPending: boolean;
  selectedElement?: string;
  model: string;
  onModelChange: (value: string) => void;
  imageModel: string;
  onImageModelChange: (value: string) => void;
  effort: ReasoningEffort | undefined;
  supportedEfforts: ReasoningEffort[] | undefined;
  onEffortChange: (value: ReasoningEffort) => void;
  credits: Credits | null;
  isAnonymous: boolean;
  isModelDisabled: (m: { pro: boolean }) => boolean;
  /** Past user messages for Up/Down history navigation. */
  history: string[];
}

export function ChatComposer({
  input, onInputChange, onSend, onStop,
  isRunning, hasPending, selectedElement,
  model, onModelChange, imageModel, onImageModelChange,
  effort, supportedEfforts, onEffortChange,
  credits, isAnonymous, isModelDisabled, history,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editModels = useMemo(() => EDIT_MODELS, []);
  const imageModels = useMemo(() => IMAGE_MODELS, []);
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
      // Only navigate history when cursor is on the first line
      const cursorPos = ta.selectionStart;
      const textBeforeCursor = ta.value.slice(0, cursorPos);
      if (textBeforeCursor.includes('\n')) return; // not on first line

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
      // Only navigate when cursor is on the last line
      const cursorPos = ta.selectionStart;
      const textAfterCursor = ta.value.slice(cursorPos);
      if (textAfterCursor.includes('\n')) return; // not on last line

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

  return (
    <div className="aui-composer-area">
      {selectedElement && (
        <div style={{ marginBottom: 4 }}>
          <Badge size="xs" variant="light" color="violet" style={{ maxWidth: '100%', textTransform: 'none' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(() => {
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
          ref={textareaRef}
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
        <Popover position="top-start" shadow="md">
          <Popover.Target>
            <Text size="xs" c="dimmed" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {shortModelName(model)}{effort ? ` · ${effort}` : ''} · {shortModelName(imageModel)}
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="md">
              <div>
                <Text size="xs" fw={600} mb={4}>Edit model</Text>
                <Radio.Group value={model} onChange={v => onModelChange(v)}>
                  <Stack gap={4}>
                    {editModels.map(m => (
                      <Tooltip key={m.value} label="Pro subscription required" disabled={!isModelDisabled(m)} position="right">
                        <div><Radio value={m.value} label={m.label} size="xs" disabled={isModelDisabled(m)} /></div>
                      </Tooltip>
                    ))}
                  </Stack>
                </Radio.Group>
              </div>
              {supportedEfforts && (
                <div>
                  <Text size="xs" fw={600} mb={4}>Thinking effort</Text>
                  <Radio.Group value={effort ?? 'high'} onChange={v => onEffortChange(v as ReasoningEffort)}>
                    <Stack gap={4}>
                      {supportedEfforts.map(e => (
                        <Radio key={e} value={e} label={e[0].toUpperCase() + e.slice(1)} size="xs" />
                      ))}
                    </Stack>
                  </Radio.Group>
                </div>
              )}
              <div>
                <Text size="xs" fw={600} mb={4}>Image model</Text>
                <Radio.Group value={imageModel} onChange={v => onImageModelChange(v)}>
                  <Stack gap={4}>
                    {imageModels.map(m => (
                      <Tooltip key={m.value} label="Pro subscription required" disabled={!isModelDisabled(m)} position="right">
                        <div><Radio value={m.value} label={m.label} size="xs" disabled={isModelDisabled(m)} /></div>
                      </Tooltip>
                    ))}
                  </Stack>
                </Radio.Group>
              </div>
            </Stack>
          </Popover.Dropdown>
        </Popover>
        <div className="aui-composer-footer-actions">
          {credits && (
            <CreditsIndicator remaining={credits.remaining} limit={credits.limit} creditsByModel={credits.creditsByModel} isAnonymous={isAnonymous} rechargeAt={credits.rechargeAt} />
          )}
          <Tooltip label={isRunning ? 'Stop' : 'Send (Enter)'}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={isRunning ? onStop : onSend}
              disabled={!isRunning && (!input.trim() || hasPending)}
            >
              {isRunning ? <IconPlayerStop size={16} /> : <IconArrowUp size={16} />}
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
