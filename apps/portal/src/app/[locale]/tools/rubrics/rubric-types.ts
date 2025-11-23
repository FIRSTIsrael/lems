export interface RubricFieldValue {
  value: number | null;
  notes?: string;
}

export type RubricFeedback = {
  'great-job': string;
  'think-about': string;
};

export interface RubricFormValues {
  fields: { [fieldId: string]: RubricFieldValue };
  feedback?: RubricFeedback;
}
