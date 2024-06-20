import { ObjectId } from 'mongodb';
import { JudgingCategory, RubricStatus, CoreValuesAwards } from '../constants';

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
    values: { [key: string]: RubricValue };
    feedback: { greatJob: string; thinkAbout: string };
  };
}
