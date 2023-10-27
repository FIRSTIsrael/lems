import { ObjectId } from 'mongodb';

export interface CVFormSubject {
  subjectType: 'team' | 'student' | 'coach' | 'parent' | 'spectator' | 'volunteer';
  subjectAffiliation?: string;
}

export interface CVFormAuthor {
  name: string;
  phone: string;
  affiliation: string;
}

export type CVFormCategoryNames =
  | 'exceedsExpectations'
  | 'aboveExpectations'
  | 'standardExpectations'
  | 'possibleConcern'
  | 'belowExpectations'
  | 'inappropriate';

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
  eventId: ObjectId;
  teamId: ObjectId;
  observers: Array<CVFormSubject>;
  demonstrators: Array<CVFormSubject>;
  data: Array<{ [key in CVFormCategoryNames]: CVFormCategory }>;
  details: string;
  completedBy: CVFormAuthor;
  actionTaken: string;
}
