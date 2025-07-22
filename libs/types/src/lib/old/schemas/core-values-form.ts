import { ObjectId, WithId } from 'mongodb';
import { Team } from './team';

export const CVFormSubjectTypes = [
  'team',
  'student',
  'coach',
  'parent',
  'spectator',
  'volunteer'
] as const;
export type CVFormSubject = (typeof CVFormSubjectTypes)[number];

export interface CVFormAuthor {
  name: string;
  phone: string;
  affiliation: string;
}

export const CVFormCategoryNamesTypes = [
  'exceedsExpectations',
  'aboveExpectations',
  'standardExpectations',
  'possibleConcern',
  'belowExpectations',
  'inappropriate'
] as const;
export type CVFormCategoryNames = (typeof CVFormCategoryNamesTypes)[number];

export interface CVFormCategory {
  teamOrStudent: {
    fields: Array<boolean>;
    other?: string;
  };
  anyoneElse: {
    fields: Array<boolean>;
    other?: string;
  };
}

export interface CoreValuesForm {
  divisionId: ObjectId;
  observers: Array<CVFormSubject>;
  observerAffiliation?: WithId<Team> | null;
  demonstrators: Array<CVFormSubject>;
  demonstratorAffiliation?: WithId<Team> | null;
  data: { [key in CVFormCategoryNames]: CVFormCategory };
  details: string;
  completedBy: CVFormAuthor;
  severity: CVFormCategoryNames;
  actionTaken?: string;
  actionTakenBy?: string;
}
