import type { App } from '@modelcontextprotocol/ext-apps';

/** What the MCP widgets share about talking to the host. */

/** The text of a tool result, for showing when it carries no structured content. */
export function textOf(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (result.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n');
}

/**
 * Tell the model something the user did here — which drawing they chose, what a picture was
 * saved as. Context first: it reaches the model with the user's next message, quietly. claude.ai
 * puts a ui/message into the input box for the user to send, under a warning about untrusted
 * prompts, so that is only the fallback for hosts that take no context.
 */
export async function tellModel(app: App, text: string): Promise<void> {
  const content = [{ type: 'text' as const, text }];
  const host = app.getHostCapabilities();
  try {
    if (host?.updateModelContext) await app.updateModelContext({ content });
    else if (host?.message) await app.sendMessage({ role: 'user', content });
  } catch {
    // What was done is shown either way; the user can name it to the model.
  }
}
