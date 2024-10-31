import { CoreValuesAwards, JudgingCategory } from '@lems/types';
import { rubricSchemaColumns, rubricSchemaFeedbackFields } from './common';

export interface RubricSchemaField {
  id: string;
  title: string;
  isCoreValuesField?: boolean;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  label_4?: string;
}

export interface RubricSchemaSection {
  title: string;
  description: string;
  fields: Array<RubricSchemaField>;
}

export interface RubricSchemaAwardCandidature {
  id: CoreValuesAwards;
  title: string;
  description: string;
}

export interface RubricsSchema {
  category: JudgingCategory;
  season: string;
  title: string;
  description: string;
  columns: typeof rubricSchemaColumns;
  sections: Array<RubricSchemaSection>;
  awards?: Array<RubricSchemaAwardCandidature>;
  feedback?: { description: string; fields: typeof rubricSchemaFeedbackFields };
  cvDescription?: string;
}
