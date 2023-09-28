import { DivisionColor } from '../constants';
import { Role } from '../roles';

export interface EventScheduleEntry {
  startTime: Date;
  endTime: Date;
  name: string;
  roles: Array<Role>;
}

export interface Event {
  name: string;
  startDate: Date;
  endDate: Date;
  color: DivisionColor;
  schedule?: Array<EventScheduleEntry>;
}
