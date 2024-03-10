import { DivisionColor } from '../constants';
import { Role } from '../roles';

export interface EventScheduleEntry {
  startTime: Date;
  endTime: Date;
  name: string;
  roles: Array<Role>;
  showOnDashboard?: boolean;
}

export interface Event {
  name: string;
  startDate: Date;
  endDate: Date;
  color: DivisionColor;
  hasState: boolean;
  salesforceId?: string;
  schedule?: Array<EventScheduleEntry>;
}
