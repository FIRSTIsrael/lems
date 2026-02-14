import { Request } from 'express';

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
  divisionId: string;
}

export interface PortalDivisionRequest extends Request {
  divisionId: string;
}

export interface SchedulerRequest extends Request {
  divisionId: string;
}

export interface FirstIsraelDashboardRequest extends Request {
  teamSlug: string;
}

export interface FirstIsraelDashboardEventRequest extends FirstIsraelDashboardRequest {
  divisionId: string;
  eventSlug: string;
}
