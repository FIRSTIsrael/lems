import { ObjectId } from 'mongodb';
import { Status, TicketType } from '../constants';

export interface Ticket {
  team: ObjectId;
  event: ObjectId;
  created: Date;
  closed?: Date;
  status: Status;
  content: string;
  type: TicketType;
}
