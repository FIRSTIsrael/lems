import { ObjectId } from 'mongodb';
import { JwtPayload } from 'jsonwebtoken';

export interface JwtTokenData extends JwtPayload {
  userId: ObjectId;
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
