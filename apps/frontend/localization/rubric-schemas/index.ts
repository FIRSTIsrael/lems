import coreValuesSchema from './core-values';
import innovationProjectSchema from './innovation-project';
import robotDesignSchema from './robot-design';
import { JudgingCategory, OptionalAwards } from '@lems/types';

export interface RubricSchemaField {
  id: string;
  label_1?: string;
  label_2?: string;
  label_3?: string;
  label_4?: string;
}

export interface RubricSchemaSection {
  title: string;
  description: string;
  fields: RubricSchemaField[];
}

export interface RubricSchemaAwardCandidature {
  id: OptionalAwards;
  title: string;
  description: string;
}

export const rubricSchemaColumns = [
  {
    title: 'מתחילה',
    description: 'ניכר באופן מינימלי בין חברי הקבוצה'
  },
  {
    title: 'מתפתחת',
    description: 'ניכר באופן לא עקבי בין חברי הקבוצה'
  },
  {
    title: 'מיומנת',
    description: 'ניכר באופן עקבי בין חברי הקבוצה'
  },
  {
    title: 'מצטיינת'
  }
];

export const rubricSchemaFeedback = [
  {
    id: 'greatJob',
    title: 'עבודה מצוינת'
  },
  {
    id: 'thinkAbout',
    title: 'חשבו על'
  }
];

export interface RubricsSchema {
  category: JudgingCategory;
  season: string;
  title: string;
  description: string;
  columns: typeof rubricSchemaColumns;
  sections: RubricSchemaSection[];
  awards?: RubricSchemaAwardCandidature[];
  feedback?: typeof rubricSchemaFeedback;
}

const rubricsSchemas: { [K in JudgingCategory]: RubricsSchema } = {
  'core-values': coreValuesSchema,
  'innovation-project': innovationProjectSchema,
  'robot-design': robotDesignSchema
};

export default rubricsSchemas;
