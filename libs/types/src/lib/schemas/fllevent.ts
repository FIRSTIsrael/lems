import { WithId } from 'mongodb';
import { Division } from './division';

export interface FllEvent {
  name: string;
  startDate: Date;
  endDate: Date;
  color?: string;
  enableDivisions?: boolean;
  salesforceId?: string;
  divisions?: Array<WithId<Division>>;
}

export interface DivisionWithEvent extends Division {
  event: WithId<FllEvent>;
}
