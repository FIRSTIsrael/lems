import { ObjectId } from 'mongodb';

export interface Team {
  divisionId: ObjectId;
  number: number;
  name: string;
  registered: boolean;
  affiliation: {
    name: string;
    city: string;
  };
  profileDocumentUrl?: string;
}
