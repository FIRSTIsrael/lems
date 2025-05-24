import { Annotation } from '@langchain/langgraph';
import { z } from 'zod';

export const GraphAnnotation = Annotation.Root({
  rubric: Annotation<z.infer<typeof RubricSchema>>(),
  feedback: Annotation<z.infer<typeof FeedbackSchema>>(),

  isValid: Annotation<boolean>(),
  error: Annotation<string>()
});

const FeedbackSchema = z.object({
  greatJob: z.string().describe('Positive feedback highlighting what the team did well'),
  thinkAbout: z.string().describe('Constructive feedback suggesting areas for improvement')
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RubricSchema = z.object({
  category: z.string().describe('The judging category for this rubric'),
  feedback: FeedbackSchema,
  values: z
    .record(
      z.object({
        value: z.number().describe("A score between 1 and 4 indicating the team's performance"),
        notes: z
          .string()
          .optional()
          .describe(
            'Optional note explaining why the team received the highest score (4) for this value'
          )
      })
    )
    .optional()
    .describe('Rubric score values'),
  awards: z.record(z.boolean()).optional().describe('Optional awards selections')
});
