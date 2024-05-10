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
  color: DivisionColor; //Turn into RGB string
  hasState: boolean;
  schedule?: Array<DivisionScheduleEntry>;
}
