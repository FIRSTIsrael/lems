export interface RubricFieldValue {
  value: number | null;
  notes?: string;
}

export type RubricFeedback = {
  greatJob: string;
  thinkAbout: string;
};

export interface RubricFormValues {
  fields: { [fieldId: string]: RubricFieldValue };
  feedback?: RubricFeedback;
}
