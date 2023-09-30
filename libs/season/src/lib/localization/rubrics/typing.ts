import { OptionalAwards, JudgingCategory, RubricFields, RubricInnerFields } from '@lems/types';
import { rubricSchemaColumns, rubricSchemaFeedback } from './common';

export interface RubricSchemaField<T extends JudgingCategory> {
  id: RubricFields<T> | RubricInnerFields<T>;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  label_4?: string;
}

export interface RubricSchemaSection<T extends JudgingCategory> {
  title: string;
  description: string;
  fields: Array<RubricSchemaField<T>>;
}

export interface RubricSchemaAwardCandidature {
  id: OptionalAwards;
  title: string;
  description: string;
}

export interface RubricsSchema<T extends JudgingCategory> {
  category: JudgingCategory;
  season: string;
  title: string;
  description: string;
  columns: typeof rubricSchemaColumns;
  sections: Array<RubricSchemaSection<T>>;
  awards?: Array<RubricSchemaAwardCandidature>;
  feedback?: typeof rubricSchemaFeedback;
}
