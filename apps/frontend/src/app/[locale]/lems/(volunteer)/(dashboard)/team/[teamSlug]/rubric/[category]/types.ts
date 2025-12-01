import { JudgingCategory, RubricStatus } from '@lems/database';

export type RubricFieldValue = {
  value: 1 | 2 | 3 | 4 | null;
  notes?: string;
};

type RubricFeedback = {
  greatJob?: string;
  thinkAbout?: string;
};

export interface RubricData {
  awards?: Record<string, boolean>;
  fields: Record<string, RubricFieldValue>;
  feedback?: RubricFeedback;
}

export interface RubricItem {
  id: string;
  category: JudgingCategory;
  status: RubricStatus;
  data?: RubricData;
}
