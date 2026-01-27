import { ObjectId } from 'mongodb';

export interface Faq {
  _id?: ObjectId;
  seasonId: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
