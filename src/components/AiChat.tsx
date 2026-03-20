import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Stack,
  TextInput,
  ActionIcon,
  Text,
  ScrollArea,
  Paper,
  Group,
  Badge,
  Loader,
  Tooltip,
  Code,
} from '@mantine/core';
import { IconSend, IconSquare, IconSparkles, IconUser, IconTool } from '@tabler/icons-react';
import { sendChatRequest, type ChatMessage, type ChatToolCall } from '../lib/api-client';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ChatToolCall[];
}

interface AiChatProps {
  svgCode: string;
  selectedElement?: string;
  onApplySvg: (svg: string, summary: string) => void;
}

export function AiChat({ svgCode, selectedElement, onApplySvg }: AiChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: DisplayMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    scrollToBottom();

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const chatMessages: ChatMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatRequest(
        chatMessages,
        svgCode,
        selectedElement,
        abortController.signal,
      );

      setUsage(response.usage);

      const assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-apply replace_svg tool calls
      if (response.toolCalls?.length) {
        for (const tc of response.toolCalls) {
          if (tc.name === 'replace_svg') {
            const args = tc.arguments as { svg: string; summary: string };
            onApplySvg(args.svg, args.summary);
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const errorMsg: DisplayMessage = {
        role: 'assistant',
        content: `Error: ${(err as Error).message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      abortRef.current = null;
      scrollToBottom();
    }
  }, [input, loading, messages, svgCode, selectedElement, onApplySvg, scrollToBottom]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <Stack h="100%" gap={0} style={{ backgroundColor: '#1e1e1e' }}>
      {/* Messages */}
      <ScrollArea flex={1} viewportRef={viewportRef} p="xs">
        {messages.length === 0 && (
          <Stack align="center" justify="center" h="100%" gap="xs" py="xl">
            <IconSparkles size={32} color="var(--mantine-color-blue-4)" />
            <Text size="sm" c="dimmed" ta="center">
              Ask me to edit your SVG.
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              e.g. "make the rectangle blue" or "add a drop shadow"
            </Text>
          </Stack>
        )}

        {messages.map((msg, i) => (
          <Paper
            key={i}
            p="xs"
            mb="xs"
            radius="sm"
            style={{
              backgroundColor: msg.role === 'user' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-dark-6)',
              borderLeft: msg.role === 'assistant' ? '2px solid var(--mantine-color-blue-6)' : undefined,
            }}
          >
            <Group gap={6} mb={4}>
              {msg.role === 'user' ? (
                <IconUser size={14} color="var(--mantine-color-gray-5)" />
              ) : (
                <IconSparkles size={14} color="var(--mantine-color-blue-4)" />
              )}
              <Text size="xs" c="dimmed" fw={600}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </Text>
            </Group>
            <Text size="sm" c="gray.3" style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </Text>
            {msg.toolCalls?.map((tc, j) => (
              <Group key={j} gap={4} mt={4}>
                <IconTool size={12} color="var(--mantine-color-green-5)" />
                <Text size="xs" c="green.5">
                  {tc.name}
                </Text>
                {tc.name === 'replace_svg' && (
                  <Text size="xs" c="dimmed">
                    — {(tc.arguments as { summary?: string }).summary}
                  </Text>
                )}
              </Group>
            ))}
          </Paper>
        ))}

        {loading && (
          <Group gap="xs" p="xs">
            <Loader size="xs" />
            <Text size="xs" c="dimmed">Thinking...</Text>
          </Group>
        )}
      </ScrollArea>

      {/* Usage counter */}
      {usage && (
        <Group justify="center" py={4}>
          <Badge size="xs" variant="light" color={usage.used >= usage.limit ? 'red' : 'blue'}>
            {usage.used}/{usage.limit} edits today
          </Badge>
        </Group>
      )}

      {/* Input area */}
      <Group gap={4} p="xs" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
        <TextInput
          flex={1}
          placeholder="Ask about your SVG..."
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          size="sm"
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-6)',
              borderColor: 'var(--mantine-color-dark-4)',
              color: 'var(--mantine-color-gray-2)',
            },
          }}
        />
        {loading ? (
          <Tooltip label="Stop">
            <ActionIcon variant="subtle" color="red" onClick={handleAbort} size="lg">
              <IconSquare size={18} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="Send (Enter)">
            <ActionIcon
              variant="filled"
              color="blue"
              onClick={handleSend}
              disabled={!input.trim()}
              size="lg"
            >
              <IconSend size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Stack>
  );
}
