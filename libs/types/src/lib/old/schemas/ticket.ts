import { ObjectId } from 'mongodb';
import { TicketType } from '../constants';

export interface Ticket {
  teamId: ObjectId | null;
  divisionId: ObjectId;
  created: Date;
  closed?: Date;
  reasonForClose?: string;
  content: string;
  type: TicketType;
}
