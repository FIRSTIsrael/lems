import { WithId } from 'mongodb';
import { FllEvent, Division, Team } from '@lems/types';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      // Old - should be removed or updated
      user?: string; // User id if the user is currently logged in
      userType?: 'admin' | 'event-user'; // Type of user, if the user is logged in
      division?: WithId<Division>;
      event?: WithId<FllEvent>;
      team?: WithId<Team>;
      teamNumber?: number;
    }
  }
}

export interface AdminRequest extends Request {
  userId: string;
  userType: 'admin'; // Always admin for AdminRequest
}

export interface AdminEventRequest extends AdminRequest {
  eventId: string;
}

export interface AdminDivisionRequest extends AdminEventRequest {
  divisionId: string;
}

export interface PortalEventRequest extends Request {
  eventId: string;
}

export interface PortalTeamRequest extends Request {
  teamId: string;
}

export interface PortalTeamAtEventRequest extends Request {
  teamId: string;
  eventId: string;
}

export interface SchedulerRequest extends Request {
  divisionId: string;
}
