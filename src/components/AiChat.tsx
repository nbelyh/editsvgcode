import { useState, useCallback, useRef, createContext, useContext, type FC } from 'react';
import {
  useExternalStoreRuntime,
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  type ThreadMessageLike,
  type AppendMessage,
} from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import { Badge, Button, Group, Loader, Text } from '@mantine/core';
import { IconSparkles, IconUser, IconTool, IconPlus } from '@tabler/icons-react';
import { sendChatRequest, type ChatMessage, type ChatToolCall } from '../lib/api-client';
import './AiChat.css';

interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ChatToolCall[];
}

interface AiChatProps {
  svgCode: string;
  selectedElement?: string;
  onPreviewSvg: (svg: string | null) => void;
  onAcceptSvg: (svg: string) => void;
}

type ProposalStatus = 'pending' | 'accepted' | 'rejected';

interface ProposalContextValue {
  messages: StoredMessage[];
  statuses: Map<number, ProposalStatus>;
  onAccept: (messageIndex: number) => void;
  onReject: (messageIndex: number) => void;
}

const ProposalContext = createContext<ProposalContextValue | null>(null);

/** Convert stored messages to assistant-ui format (text only — tool calls rendered manually) */
function toThreadMessages(messages: StoredMessage[]): ThreadMessageLike[] {
  return messages.map((m, i): ThreadMessageLike => ({
    id: `msg-${i}`,
    role: m.role,
    content: m.content,
  }));
}

const UserMessage: FC = () => (
  <div className="aui-msg aui-msg-user">
    <div className="aui-msg-header">
      <IconUser size={14} />
      <span>You</span>
    </div>
    <MessagePrimitive.Content />
  </div>
);

const AssistantText: FC = () => (
  <div className="aui-markdown">
    <MarkdownTextPrimitive />
  </div>
);

const AssistantMessageWithProposals: FC<{ messageIndex: number }> = ({ messageIndex }) => {
  const ctx = useContext(ProposalContext);
  if (!ctx) return null;

  const msg = ctx.messages[messageIndex];
  const status = ctx.statuses.get(messageIndex);

  return (
    <div className="aui-msg aui-msg-assistant">
      <div className="aui-msg-header">
        <IconSparkles size={14} />
        <span>AI</span>
      </div>
      <MessagePrimitive.Content components={{ Text: AssistantText }} />
      {msg?.toolCalls?.map((tc, j) => {
        if (tc.name === 'replace_svg') {
          const summary = (tc.arguments as { summary?: string }).summary ?? 'SVG change';
          return (
            <div key={j} className="aui-proposal">
              <div className="aui-proposal-header">
                <IconTool size={14} />
                <span className="aui-proposal-summary">{summary}</span>
              </div>
              {status === 'pending' && (
                <div className="aui-proposal-actions">
                  <Button size="compact-xs" variant="filled" onClick={() => ctx.onAccept(messageIndex)}>
                    Accept
                  </Button>
                  <Button size="compact-xs" variant="default" onClick={() => ctx.onReject(messageIndex)}>
                    Dismiss
                  </Button>
                </div>
              )}
              {status === 'accepted' && (
                <Text size="xs" fw={600} c="blue" mt={6}>✓ Applied</Text>
              )}
              {status === 'rejected' && (
                <Text size="xs" fw={600} c="dimmed" mt={6}>Dismissed</Text>
              )}
            </div>
          );
        }
        return (
          <div key={j} className="aui-tool-call">
            <IconTool size={12} />
            <span>{tc.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export function AiChat({ svgCode, selectedElement, onPreviewSvg, onAcceptSvg }: AiChatProps) {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [proposalStatuses, setProposalStatuses] = useState<Map<number, ProposalStatus>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  // Refs for latest values so callbacks don't go stale
  const svgCodeRef = useRef(svgCode);
  svgCodeRef.current = svgCode;
  const selectedElementRef = useRef(selectedElement);
  selectedElementRef.current = selectedElement;
  const onPreviewSvgRef = useRef(onPreviewSvg);
  onPreviewSvgRef.current = onPreviewSvg;
  const onAcceptSvgRef = useRef(onAcceptSvg);
  onAcceptSvgRef.current = onAcceptSvg;

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setProposalStatuses(new Map());
    setUsage(null);
    onPreviewSvgRef.current(null);
  }, []);

  const handleAcceptProposal = useCallback((messageIndex: number) => {
    const msg = messages[messageIndex];
    const tc = msg?.toolCalls?.find(t => t.name === 'replace_svg');
    if (tc) {
      const args = tc.arguments as { svg: string };
      onAcceptSvgRef.current(args.svg);
      setProposalStatuses(prev => new Map(prev).set(messageIndex, 'accepted'));
    }
  }, [messages]);

  const handleRejectProposal = useCallback((messageIndex: number) => {
    onPreviewSvgRef.current(null);
    setProposalStatuses(prev => new Map(prev).set(messageIndex, 'rejected'));
  }, []);

  const onNew = useCallback(async (message: AppendMessage) => {
    const userText = message.content
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');

    if (!userText.trim()) return;

    const userMsg: StoredMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setIsRunning(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const allMessages = [...messages, userMsg];
      const chatMessages: ChatMessage[] = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatRequest(
        chatMessages,
        svgCodeRef.current,
        selectedElementRef.current,
        abortController.signal,
      );

      setUsage(response.usage);

      const assistantMsg: StoredMessage = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls,
      };

      setMessages((prev) => {
        const newMessages = [...prev, assistantMsg];
        // Show diff preview and mark as pending for replace_svg tool calls
        if (response.toolCalls?.length) {
          const replaceTc = response.toolCalls.find(tc => tc.name === 'replace_svg');
          if (replaceTc) {
            const msgIndex = newMessages.length - 1;
            setProposalStatuses(prevS => new Map(prevS).set(msgIndex, 'pending'));
            onPreviewSvgRef.current((replaceTc.arguments as { svg: string }).svg);
          }
        }
        return newMessages;
      });
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Error: ${(err as Error).message}`,
      }]);
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [messages]);

  const onCancel = useCallback(async () => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const threadMessages = toThreadMessages(messages);

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages: threadMessages,
    convertMessage: (m: ThreadMessageLike) => m,
    onNew,
    onCancel,
  });

  const proposalCtx: ProposalContextValue = {
    messages,
    statuses: proposalStatuses,
    onAccept: handleAcceptProposal,
    onReject: handleRejectProposal,
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ProposalContext.Provider value={proposalCtx}>
        <div className="aui-root">
          <ThreadPrimitive.Root className="aui-thread">
            <ThreadPrimitive.Viewport className="aui-viewport">
              <ThreadPrimitive.Empty>
                <div className="aui-empty">
                  <IconSparkles size={32} className="aui-empty-icon" />
                  <p>Ask me to edit your SVG.</p>
                  <p className="aui-empty-hint">e.g. "make the rectangle blue" or "add a drop shadow"</p>
                </div>
              </ThreadPrimitive.Empty>

              <ThreadPrimitive.Messages>
                {({ message }) => {
                  if (message.role === 'user') return <UserMessage />;
                  const idx = parseInt(String(message.id).replace('msg-', ''));
                  return <AssistantMessageWithProposals messageIndex={idx} />;
                }}
              </ThreadPrimitive.Messages>

              <ThreadPrimitive.If running>
                <Group gap="xs" p="xs">
                  <Loader size={14} type="dots" />
                  <Text size="xs" c="dimmed">Thinking…</Text>
                </Group>
              </ThreadPrimitive.If>
            </ThreadPrimitive.Viewport>

            {usage && (
              <Group justify="center" py={4}>
                <Badge size="xs" variant="light" color={usage.used >= usage.limit ? 'red' : 'blue'}>
                  {usage.used}/{usage.limit} edits today
                </Badge>
              </Group>
            )}

            <div className="aui-composer-area">
              <Group gap={4} mb={4} justify="flex-end">
                <ThreadPrimitive.If empty={false}>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    leftSection={<IconPlus size={14} />}
                    onClick={handleNewChat}
                  >
                    New Chat
                  </Button>
                </ThreadPrimitive.If>
              </Group>
              <ComposerPrimitive.Root className="aui-composer">
                <ComposerPrimitive.Input
                  placeholder="Ask about your SVG..."
                  className="aui-composer-input"
                  autoFocus
                />
                <ComposerPrimitive.Send className="aui-composer-send">
                  Send
                </ComposerPrimitive.Send>
              </ComposerPrimitive.Root>
            </div>
          </ThreadPrimitive.Root>
        </div>
      </ProposalContext.Provider>
    </AssistantRuntimeProvider>
  );
}
