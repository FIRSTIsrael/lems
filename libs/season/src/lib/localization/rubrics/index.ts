import coreValuesSchema from './core-values';
import innovationProjectSchema from './innovation-project';
import robotDesignSchema from './robot-design';
import { RubricsSchema } from './typing';
import { JudgingCategory } from '@lems/types';

export const rubricsSchemas: { [K in JudgingCategory]: RubricsSchema<K> } = {
  'core-values': coreValuesSchema,
  'innovation-project': innovationProjectSchema,
  'robot-design': robotDesignSchema
};
