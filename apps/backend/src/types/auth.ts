import { JwtPayload } from 'jsonwebtoken';

export interface JwtTokenData extends JwtPayload {
  userId: string;
  userType: 'admin' | 'event-user';
}

export interface DashboardTokenData extends JwtPayload {
  eventSalesforceId: string;
  teamNumber: number;
}

export interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: Array<string>;
}
