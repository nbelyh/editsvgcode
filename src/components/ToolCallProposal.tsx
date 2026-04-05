import { IconPencil, IconCode, IconCheck, IconX } from '@tabler/icons-react';
import type { ChatToolCall } from '../lib/api-client';

export interface StoredToolCall extends ChatToolCall {
  status: 'pending' | 'accepted' | 'rejected';
}

interface ToolCallProposalProps {
  tc: StoredToolCall;
  onAccept: () => void;
  onReject: () => void;
}

export function ToolCallProposal({ tc, onAccept, onReject }: ToolCallProposalProps) {
  return (
    <div className="aui-proposal" style={{ marginBottom: 8 }}>
      <div className="aui-proposal-header">
        {tc.name === 'find_replace' ? <IconPencil size={14} /> : <IconCode size={14} />}
        <span className="aui-proposal-summary">
          {(tc.arguments.summary as string) || (tc.name === 'find_replace' ? 'Find & replace' : 'Replace SVG')}
        </span>
      </div>
      {tc.status === 'pending' && (
        <div className="aui-proposal-actions">
          <button
            className="aui-composer-send"
            style={{ fontSize: 11, padding: '3px 10px', height: 26 }}
            onClick={onAccept}
          >
            Accept
          </button>
          <button
            className="aui-composer-send"
            style={{ fontSize: 11, padding: '3px 10px', height: 26, backgroundColor: 'var(--mantine-color-dark-4)' }}
            onClick={onReject}
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
  );
}
