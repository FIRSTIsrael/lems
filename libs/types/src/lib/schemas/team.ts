import { ObjectId } from 'mongodb';

export interface Team {
  event: ObjectId;
  number: number;
  name: string;
  affiliation: { institution: string; city: string };
}
