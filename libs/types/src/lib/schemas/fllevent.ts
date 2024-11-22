import { WithId } from 'mongodb';
import { Division } from './division';

export interface FllEvent {
  name: string;
  startDate: Date;
  endDate: Date;
  salesforceId?: string;
  divisions?: Array<WithId<Division>>;
}
