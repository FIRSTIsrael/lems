import { ObjectId } from 'mongodb';
import {
  JudgingCategory,
  RubricStatus,
  OptionalAwards,
  RubricFields,
  RubricInnerFields
} from '../constants';

export interface RubricValue {
  value: number;
  exceededNotes: string;
}

export interface Rubric<T extends JudgingCategory> {
  team: ObjectId;
  category: T;
  status: RubricStatus;
  data?: {
    awards: T extends 'core-values' ? { [key in OptionalAwards]: boolean } : undefined;
    values: T extends 'core-values'
      ? { [key in RubricFields<T>]: RubricValue }
      : {
          [key in RubricFields<T>]: {
            //TODO: smart type that ensures 2 keys: one from [0] and one from [1] (using the pairs type)
            [key in RubricInnerFields<T>]: RubricValue;
          };
        };
    notes: { greatJob: string; thinkAbout: string };
  };
}
