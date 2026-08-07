import { createAgent } from 'langchain';
import { Command, MemorySaver } from '@langchain/langgraph';
import { CallbackHandler } from '@langfuse/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { toAgentStreamEvents, type AgentStreamEvent } from '../../streaming';
import { gameRulesTools } from './tools';
import { GAME_RULES_SYSTEM_PROMPT } from './prompt';
import type { ClarifyingAnswer } from './tools/ask-clarifying-question';

export interface GameRulesChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

let agent: ReturnType<typeof createAgent> | undefined;

// In-memory checkpointer: fine for a single backend instance/MVP. Swap for a durable
// (e.g. Postgres/Redis) checkpointer before running multiple instances or surviving restarts.
const checkpointer = new MemorySaver();

const model = new ChatOpenAI({
  model: 'gpt-5.6-terra', // Ensure the chosen model supports reasoning parameters

  reasoning: {
    effort: 'none',
    summary: 'concise'
  },

  temperature: 0.2,

  maxTokens: undefined,
  timeout: undefined
});

function getAgent() {
  if (!agent) {
    agent = createAgent({
      model,
      tools: gameRulesTools,
      systemPrompt: GAME_RULES_SYSTEM_PROMPT,
      checkpointer
    });
  }
  return agent;
}

function buildConfig(sessionId: string) {
  const callbacks = process.env.LANGFUSE_SECRET_KEY
    ? [new CallbackHandler({ sessionId, tags: ['fll-rules-agent'] })]
    : [];
  return { configurable: { thread_id: sessionId }, callbacks, streamMode: 'updates' as const };
}

/** Starts a new turn, streaming generic events. May end in an `interrupt` event (clarifying question). */
export async function streamGameRulesTurn(
  messages: GameRulesChatMessage[],
  sessionId: string
): Promise<AsyncIterable<AgentStreamEvent>> {
  const rawStream = await getAgent().stream({ messages }, buildConfig(sessionId));
  return toAgentStreamEvents(rawStream);
}

/** Resumes a turn paused on ask_clarifying_question with the user's answer. */
export async function resumeGameRulesTurn(
  sessionId: string,
  answer: ClarifyingAnswer
): Promise<AsyncIterable<AgentStreamEvent>> {
  const rawStream = await getAgent().stream(
    new Command({ resume: answer }),
    buildConfig(sessionId)
  );
  return toAgentStreamEvents(rawStream);
}
