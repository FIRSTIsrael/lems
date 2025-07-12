import { WithId } from 'mongodb';
import { FllEvent, Division, Team } from '@lems/types';

declare global {
  namespace Express {
    interface Request {
      user?: string; // User id if the user is currently logged in
      userType?: 'admin' | 'event-user'; // Type of user, if the user is logged in

      // Old - should be removed or updated
      division?: WithId<Division>;
      event?: WithId<FllEvent>;
      team?: WithId<Team>;
      teamNumber?: number;
    }
  }
}
