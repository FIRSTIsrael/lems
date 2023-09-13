import coreValuesSchema from './core-values';
import innovationProjectSchema from './innovation-project';
import robotDesignSchema from './robot-design';
import { JudgingCategory } from '@lems/types';

export interface RubricSchemaRubric {
  id: string;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  label_4?: string;
}

export interface RubricSchemaSection {
  title: string;
  description: string;
  rubrics: RubricSchemaRubric[];
}

export type RubricSchemaColumn = { title: string; description?: string };

export interface RubricSchemaAwardCandidature {
  id: string;
  title: string;
  description: string;
}

export type RubricSchemaFeedback = [
  {
    id: 'greatJob';
    title: 'עבודה מצוינת';
  },
  {
    id: 'thinkAbout';
    title: 'חשבו על';
  }
];

export interface RubricsSchema {
  category: JudgingCategory;
  season: string;
  title: string;
  description: string;
  columns: RubricSchemaColumn[];
  sections: RubricSchemaSection[];
  awards?: RubricSchemaAwardCandidature[];
  feedback?: RubricSchemaFeedback;
}

const rubricsSchemas: { [K in JudgingCategory]: RubricsSchema } = {
  'core-values': coreValuesSchema,
  'innovation-project': innovationProjectSchema,
  'robot-design': robotDesignSchema
};

export default rubricsSchemas;
