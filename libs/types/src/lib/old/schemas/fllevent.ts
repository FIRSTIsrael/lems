import { WithId } from 'mongodb';
import { Division } from './division';
import { EventUserAllowedRoles } from '../roles';

export interface FllEvent {
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  color?: string;
  enableDivisions?: boolean;
  salesforceId?: string;
  divisions?: Array<WithId<Division>>;
  eventUsers: Array<EventUserAllowedRoles>;
}

export interface DivisionWithEvent extends Division {
  event: WithId<FllEvent>;
}
