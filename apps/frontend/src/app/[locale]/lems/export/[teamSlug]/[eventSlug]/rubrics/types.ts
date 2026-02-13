import { JudgingCategory } from '@lems/database';

interface RubricSchema {
  sections: Array<{
    id: string;
    fields: Array<{ id: string; coreValues?: boolean }>;
  }>;
  feedback?: boolean;
}

export interface Rubric {
  scores: Record<string, number | null>;
  status?: string;
  category: JudgingCategory;
  feedback?: { greatJob: string; thinkAbout: string };
  schema?: RubricSchema;
}

export interface OptionalAward {
  id: string;
  name: string;
  description?: string;
}
