import { JwtPayload } from 'jsonwebtoken';

export interface JwtTokenData extends JwtPayload {
  userId: string;
  userType: 'admin' | 'event-user';
}

export interface FirstIsraelDashboardTokenData extends JwtPayload {
  teamSlug: string;
}

export interface FirstIsraelDashboardTokenDataWithEvent extends FirstIsraelDashboardTokenData {
  eventSalesforceId: string;
}

export interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: Array<string>;
}
