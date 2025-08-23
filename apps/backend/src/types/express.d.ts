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

/**
 * AdminRequest is a branded type that represents an Express request where:
 * - The user is authenticated as an admin
 * - The request contains non-nullable user ID and userType='admin'
 */
export interface AdminRequest extends Request {
  userId: string; // Non-nullable user ID for admin requests
  userType: 'admin'; // Always admin for AdminRequest
}
