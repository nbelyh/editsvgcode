import { useState, Fragment } from 'react';
import { IconSparkles, IconUser, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { ToolCallProposal } from '../ToolCallProposal';
import { BUY_CREDITS_URL } from '../CreditsIndicator';
import { IconPicker } from './IconPicker';
import type { DisplayMessage, ProgressStatus } from './types';
import type { IconResult } from '../../lib/api-client';

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
  iconPickIcons: IconResult[] | null;
  iconPickSelected: IconResult | null;
  onIconSelect: (icon: IconResult) => void;
  onIconMore: () => void;
  onIconNone: () => void;
}

interface Turn {
  userIdx: number;
  userMsg: DisplayMessage;
  assistantIdx?: number;
  assistantMsg?: DisplayMessage;
}

function groupIntoTurns(messages: DisplayMessage[]): Turn[] {
  const turns: Turn[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'user') {
      const next = messages[i + 1];
      if (next?.role === 'assistant') {
        turns.push({ userIdx: i, userMsg: msg, assistantIdx: i + 1, assistantMsg: next });
        i++;
      } else {
        turns.push({ userIdx: i, userMsg: msg });
      }
    } else {
      turns.push({ userIdx: i, userMsg: msg });
    }
  }
  return turns;
}

function isTurnCompleted(turn: Turn): boolean {
  return turn.assistantMsg != null &&
    !turn.assistantMsg.toolCalls?.some(tc => tc.status === 'pending');
}

export function ChatThread({
  messages, isRunning, progressStatus, canUndo,
  viewportRef, endRef,
  onAccept, onReject, onUpdateToolCallSvg, onRestore,
  iconPickIcons, iconPickSelected, onIconSelect, onIconMore, onIconNone,
}: ChatThreadProps) {
  const [expandedTurns, setExpandedTurns] = useState<Set<number>>(new Set());
  const progressLabel = typeof progressStatus === 'string' ? progressStatus : progressStatus.tool;

  const toggleExpand = (turnIdx: number) => {
    setExpandedTurns(prev => {
      const next = new Set(prev);
      if (next.has(turnIdx)) next.delete(turnIdx); else next.add(turnIdx);
      return next;
    });
  };

  const turns = groupIntoTurns(messages);

  return (
    <div className="aui-viewport" ref={viewportRef}>
      {messages.length === 0 && (
        <div className="aui-empty">
          <IconSparkles size={32} className="aui-empty-icon" />
          <p>Ask AI to edit your SVG</p>
          <p className="aui-empty-hint">e.g. select an item and tell it to &quot;change the fill to blue&quot;</p>
        </div>
      )}

      {turns.map((turn, turnIdx) => {
        const isLast = turnIdx === turns.length - 1;
        const completed = isTurnCompleted(turn);
        const collapsed = completed && !isLast && !expandedTurns.has(turnIdx);

        if (collapsed) {
          const summary = turn.userMsg.content
            ? turn.userMsg.content.length > 80 ? turn.userMsg.content.slice(0, 80) + '…' : turn.userMsg.content
            : 'AI response';
          const toolSummary = turn.assistantMsg?.toolCalls
            ?.filter(tc => tc.arguments.summary)
            .map(tc => tc.arguments.summary as string)
            .join(', ');
          return (
            <div key={turnIdx} className="aui-turn-collapsed" onClick={() => toggleExpand(turnIdx)}>
              <IconChevronRight size={14} className="aui-turn-chevron" />
              <span className="aui-turn-summary-user">{summary}</span>
              {toolSummary && <span className="aui-turn-summary-response"> — {toolSummary}</span>}
            </div>
          );
        }

        const msgIndices = [turn.userIdx];
        if (turn.assistantIdx != null) msgIndices.push(turn.assistantIdx);

        return (
          <div key={turnIdx} className="aui-turn-expanded">
            {completed && !isLast && (
              <div className="aui-turn-collapse-btn" onClick={() => toggleExpand(turnIdx)}>
                <IconChevronDown size={14} className="aui-turn-chevron" />
              </div>
            )}
            {msgIndices.map(msgIdx => {
              const msg = messages[msgIdx];
              const showCheckpoint = msg.role === 'user';

              if (msg.role === 'assistant' && msg.toolCalls?.length && !msg.content) {
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

              return (<Fragment key={msgIdx}>
              {showCheckpoint && canUndo && (
                <div className="aui-checkpoint">
                  <div className="aui-checkpoint-line" />
                  <button className="aui-checkpoint-restore" onClick={() => onRestore(msgIdx)}>Restore</button>
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
                {msg.selectedIcon && (
                  <div className="aui-icon-picker aui-icon-picker-collapsed">
                    <span className="aui-icon-picker-label">Icon:</span>
                    <div className="aui-icon-picker-selected">
                      <div className="aui-icon-picker-svg" dangerouslySetInnerHTML={{ __html: msg.selectedIcon.svg }} />
                      <span className="aui-icon-picker-selected-name">{msg.selectedIcon.name}</span>
                    </div>
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
              </Fragment>);
            })}
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
