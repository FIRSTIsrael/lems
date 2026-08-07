import { tool } from 'langchain';
import { interrupt } from '@langchain/langgraph';
import { z } from 'zod';

export interface ClarifyingQuestion {
  prompt: string;
  options: Array<{ id: string; label: string }>;
}

// Exactly one of these is set - selectedOptionId for a listed option, otherText for the UI's free-text "Other".
export interface ClarifyingAnswer {
  selectedOptionId?: string;
  otherText?: string;
}

export const askClarifyingQuestion = tool(
  // Pauses the graph run (via the checkpointer) until the host resumes with a ClarifyingAnswer.
  async ({ prompt, options }) =>
    interrupt<ClarifyingQuestion, ClarifyingAnswer>({ prompt, options }),
  {
    name: 'ask_clarifying_question',
    description:
      'Ask the user a clarifying question with 1-3 concrete options instead of guessing. The UI always adds a separate "Other" free-text choice - never include "Other" in options. Calling this tool pauses the run until the user answers; use at most once per turn.',
    schema: z.object({
      prompt: z.string().min(1),
      options: z
        .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
        .min(1)
        .max(3)
    })
  }
);
