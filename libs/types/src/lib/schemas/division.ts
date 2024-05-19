import { ObjectId } from 'mongodb';
import { DivisionColor } from '../constants';
import { Role } from '../roles';

export interface DivisionScheduleEntry {
  startTime: Date;
  endTime: Date;
  name: string;
  roles: Array<Role>;
  showOnDashboard?: boolean;
}

export interface Division {
  name: string;
  eventId: ObjectId;
  startDate: Date; //TODO: remove
  endDate: Date; //TODO: remove
  color: DivisionColor; //Turn into RGB string
  hasState: boolean;
  schedule?: Array<DivisionScheduleEntry>;
}
