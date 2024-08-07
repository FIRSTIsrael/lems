import { ObjectId } from 'mongodb';
import {
  JudgingCategory,
  RubricStatus,
  CoreValuesAwards,
  RubricFields,
  RubricInnerFields
} from '../constants';

export interface RubricValue {
  value: number;
  notes?: string;
}

export interface Rubric<T extends JudgingCategory> {
  divisionId: ObjectId;
  teamId: ObjectId;
  category: T;
  status: RubricStatus;
  data?: {
    awards: T extends 'core-values' ? { [key in CoreValuesAwards]: boolean } : undefined;
    values: T extends 'core-values'
      ? { [key in RubricFields<T>]: RubricValue }
      : {
          [key in RubricFields<T>]: {
            //TODO: smart type that ensures 2 keys: one from [0] and one from [1]
            [key in RubricInnerFields<T>]: RubricValue;
          };
        };
    feedback: { greatJob: string; thinkAbout: string };
  };
}
