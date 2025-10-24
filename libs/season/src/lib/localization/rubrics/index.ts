import { JudgingCategory } from '@lems/types';
import coreValuesSchema from './core-values';
import innovationProjectSchema from './innovation-project';
import robotDesignSchema from './robot-design';
import { RubricsSchema } from './typing';

export const rubricsSchemas: { [T in JudgingCategory]: RubricsSchema } = {
  'core-values': coreValuesSchema,
  'innovation-project': innovationProjectSchema,
  'robot-design': robotDesignSchema
};
