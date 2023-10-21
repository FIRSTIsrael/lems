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
  profileDocument?: { id: string; link: string };
}
