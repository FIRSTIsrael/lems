import { ObjectId } from 'mongodb';
import { TicketType } from '../constants';

export interface Ticket {
  team: ObjectId;
  event: ObjectId;
  created: Date;
  closed?: Date;
  content: string;
  type: TicketType;
}
