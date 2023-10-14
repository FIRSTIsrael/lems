import { ObjectId } from 'mongodb';
import {
  JudgingCategory,
  RubricStatus,
  CoreValuesAwards,
  RubricFields,
  RubricInnerFields
} from '../constants';

export interface RubricValue {
  value: string; //Radio buttons do not like numbers, so we use string :D
  notes?: string;
}

export interface Rubric<T extends JudgingCategory> {
  team: ObjectId;
  session: ObjectId;
  category: T;
  status: RubricStatus;
  data?: {
    awards: T extends 'core-values' ? { [key in CoreValuesAwards]: boolean } : undefined;
    values: T extends 'core-values'
      ? { [key in RubricFields<T>]: RubricValue }
      : {
          [key in RubricFields<T>]: {
            //TODO: smart type that ensures 2 keys: one from [0] and one from [1] (using the pairs type)
            [key in RubricInnerFields<T>]: RubricValue;
          };
        };
    feedback: { greatJob: string; thinkAbout: string };
  };
}
