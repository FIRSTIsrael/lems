import { tool } from 'langchain';
import { z } from 'zod';

export const askClarifyingQuestion = tool(async ({ prompt, options }) => ({ prompt, options }), {
  name: 'ask_clarifying_question',
  description:
    'Ask the user a clarifying question with 1-3 concrete options instead of guessing. The UI always adds a separate "Other" free-text choice - never include "Other" in options. Calling this tool ends the current turn; the host renders the question and resumes with the user\'s answer as the next message. Use at most once per turn.',
  schema: z.object({
    prompt: z.string().min(1),
    options: z
      .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
      .min(1)
      .max(3)
  })
});
