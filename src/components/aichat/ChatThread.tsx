import { useState, Fragment, useRef, useEffect } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconSparkles, IconUser, IconChevronRight, IconChevronDown, IconTool, IconX, IconArrowUp } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { ToolCallProposal } from '../ToolCallProposal';
import { BUY_CREDITS_URL } from '../CreditsIndicator';
import { IconPicker } from './IconPicker';
import type { DisplayMessage, ProgressStatus } from './types';
import type { IconResult, ReadToolCall } from '../../lib/api-client';

interface ChatThreadProps {
  messages: DisplayMessage[];
  isRunning: boolean;
  progressStatus: ProgressStatus;
  canUndo: boolean;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
  onAccept: (msgIndex: number, tcIndex: number) => void;
  onReject: (msgIndex: number, tcIndex: number) => void;
  onUpdateToolCallSvg: (msgIndex: number, tcIndex: number, newSvg: string) => void;
  onRestore: (msgIdx: number) => void;
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
}

function ReadToolCallsBlock({ calls }: { calls: ReadToolCall[] }) {
  const [expanded, setExpanded] = useState(false);
  const summary = calls.map(tc => tc.name).join(', ');
  return (
    <div className="aui-read-tools">
      <button className="aui-read-tools-toggle" onClick={() => setExpanded(e => !e)}>
        {expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
        <IconTool size={12} />
        <span>{calls.length} tool call{calls.length > 1 ? 's' : ''}: {summary}</span>
      </button>
      {expanded && (
        <div className="aui-read-tools-details">
          {calls.map((tc, i) => (
            <div key={i} className="aui-read-tool-item">
              <div className="aui-read-tool-name">{tc.name}({Object.entries(tc.args).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')})</div>
              <pre className="aui-read-tool-result">{tc.result}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
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

export function ChatThread({
  messages, isRunning, progressStatus, canUndo,
  viewportRef, endRef,
  onAccept, onReject, onUpdateToolCallSvg, onRestore,
  editingIndex, editingText, onEditStart, onEditChange, onEditSubmit, onEditCancel,
  iconPickIcons, iconPickSelected, onIconSelect, onIconMore, onIconNone,
}: ChatThreadProps) {
  const progressLabel = typeof progressStatus === 'string' ? progressStatus : progressStatus.tool;

  return (
    <div className="aui-viewport" ref={viewportRef}>
      {messages.length === 0 && (
        <div className="aui-empty">
          <IconSparkles size={32} className="aui-empty-icon" />
          <p>Ask AI to edit your SVG</p>
          <p className="aui-empty-hint">e.g. select an item and tell it to &quot;change the fill to blue&quot;</p>
        </div>
      )}

      {messages.map((msg, msgIdx) => {
        if (msg.role === 'user') {
          const isEditing = editingIndex === msgIdx;
          return (<Fragment key={msgIdx}>
            {canUndo && (
              <div className="aui-checkpoint">
                <div className="aui-checkpoint-line" />
                <button className="aui-checkpoint-restore" onClick={() => onRestore(msgIdx)}>Restore</button>
                <div className="aui-checkpoint-line" />
              </div>
            )}
            <div className={`aui-msg aui-msg-user${!isEditing && !isRunning ? ' aui-msg-editable' : ''}`}
              onClick={!isEditing && !isRunning ? () => onEditStart(msgIdx) : undefined}
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
        if (msg.toolCalls?.length && !msg.content && !msg.readToolCalls?.length && !msg.selectedIcon) {
          return (<div key={msgIdx}>
            {msg.toolCalls.map((tc, tcIdx) => (
              <ToolCallProposal
                key={`${msgIdx}-${tcIdx}`}
                tc={tc}
                onAccept={() => onAccept(msgIdx, tcIdx)}
                onReject={() => onReject(msgIdx, tcIdx)}
                onUpdateSvg={(svg) => onUpdateToolCallSvg(msgIdx, tcIdx, svg)}
              />
            ))}
          </div>);
        }

        return (
          <div key={msgIdx} className="aui-msg aui-msg-assistant">
            {msg.readToolCalls && msg.readToolCalls.length > 0 && (
              <ReadToolCallsBlock calls={msg.readToolCalls} />
            )}
            {msg.selectedIcon && (
              <div className="aui-icon-picker aui-icon-picker-collapsed">
                <span className="aui-icon-picker-label">Icon:</span>
                <div className="aui-icon-picker-selected">
                  <div className="aui-icon-picker-svg" dangerouslySetInnerHTML={{ __html: msg.selectedIcon.svg }} />
                  <span className="aui-icon-picker-selected-name">{msg.selectedIcon.name}</span>
                </div>
              </div>
            )}
            {msg.content && (
              <div className="aui-markdown" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
                {msg.buyCredits && (
                  <> — <Link to={BUY_CREDITS_URL}>Buy Credits</Link></>
                )}
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
          </div>
        );
      })}

      {iconPickIcons && (
        <div className="aui-msg aui-msg-assistant">
          <IconPicker icons={iconPickIcons} onSelect={onIconSelect} onMore={onIconMore} onNone={onIconNone} selectedIcon={iconPickSelected} />
        </div>
      )}

      {isRunning && (!iconPickIcons || iconPickSelected) && (
        <div className="aui-msg aui-msg-assistant">
          <div className="aui-status-indicator">
            <span className="aui-spinner" />
            {progressLabel === 'thinking' && 'Thinking…'}
            {progressLabel === 'generating-image' && 'Generating image…'}
            {progressLabel === 'vectorizing' && 'Vectorizing…'}
            {typeof progressStatus === 'object' && `Calling ${progressStatus.tool}… (round ${progressStatus.round})`}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
