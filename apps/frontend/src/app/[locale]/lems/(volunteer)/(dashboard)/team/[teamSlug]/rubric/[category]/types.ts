export interface RubricFieldValue {
  value: 1 | 2 | 3 | 4 | null;
  notes?: string;
}

export interface RubricFeedback {
  'great-job'?: string;
  'think-about'?: string;
}
