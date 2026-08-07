import express from 'express';
import { z } from 'zod';
import { resumeGameRulesTurn, streamGameRulesTurn } from '../../../../lib/ai/agents/game-rules';
import { pipeAgentStreamToSSE } from '../../../../lib/ai/streaming';

const router = express.Router({ mergeParams: true });

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1)
});

const chatRequestSchema = z.union([
  z.object({ sessionId: z.string().min(1), messages: z.array(chatMessageSchema).min(1) }),
  z.object({
    sessionId: z.string().min(1),
    answer: z.object({ selectedOptionId: z.string().optional(), otherText: z.string().optional() })
  })
]);

router.post('/chat', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'INVALID_REQUEST', details: parsed.error.flatten() });
    return;
  }

  try {
    const events =
      'messages' in parsed.data
        ? await streamGameRulesTurn(parsed.data.messages, parsed.data.sessionId)
        : await resumeGameRulesTurn(parsed.data.sessionId, parsed.data.answer);
    await pipeAgentStreamToSSE(res, events);
  } catch (error) {
    res.status(500).json({ error: 'INFERENCE_FAILED', message: (error as Error).message });
  }
});

export default router;
