import { ObjectId } from 'mongodb';

export interface Team {
  eventId: ObjectId;
  number: number;
  name: string;
  registered: boolean;
  affiliation: {
    name: string;
    city: string;
  };
  profileDocumentUrl?: string;
  advancing?: boolean;
}
