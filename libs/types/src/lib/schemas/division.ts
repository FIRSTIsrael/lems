import { CSSProperties } from 'react';
import { ObjectId } from 'mongodb';
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
  color: CSSProperties['color'];
  hasState: boolean;
  schedule?: Array<DivisionScheduleEntry>;
  enableAdvancement?: boolean;
}
