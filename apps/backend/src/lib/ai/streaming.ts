import type { Response } from 'express';
import { AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';

// Generic, agent-agnostic view of a LangGraph agent run - UI-friendly and hides raw graph internals.
export type AgentStreamEvent =
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; output: unknown }
  | { type: 'thinking'; content: string }
  | { type: 'message'; content: string }
  | { type: 'interrupt'; value: unknown }
  | { type: 'done' };

/** Maps a LangGraph `updates`-mode stream (any agent) to generic stream events. */
export async function* toAgentStreamEvents(
  chunks: AsyncIterable<Record<string, unknown>>
): AsyncGenerator<AgentStreamEvent> {
  for await (const chunk of chunks) {
    if ('__interrupt__' in chunk) {
      const [firstInterrupt] = chunk.__interrupt__ as Array<{ value: unknown }>;
      yield { type: 'interrupt', value: firstInterrupt.value };
      continue;
    }

    for (const update of Object.values(chunk)) {
      const messages = (update as { messages?: BaseMessage[] } | undefined)?.messages ?? [];
      for (const message of messages) {
        if (message instanceof ToolMessage) {
          yield { type: 'tool_result', name: message.name ?? 'unknown', output: message.content };
        } else if (message instanceof AIMessage) {
          // A tool-calling turn has no answer text yet - its content is either empty or reasoning-only.
          for (const block of message.contentBlocks) {
            if (block.type === 'reasoning') yield { type: 'thinking', content: block.reasoning };
          }
          for (const call of message.tool_calls ?? []) {
            yield { type: 'tool_call', name: call.name, args: call.args };
          }
          if (message.text) yield { type: 'message', content: message.text };
        }
      }
    }
  }
  yield { type: 'done' };
}

/** Writes agent stream events to an Express response as Server-Sent Events. */
export async function pipeAgentStreamToSSE(
  res: Response,
  events: AsyncIterable<AgentStreamEvent>
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  for await (const event of events) {
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  }
  res.end();
}
