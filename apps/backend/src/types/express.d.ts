import { WithId } from 'mongodb';
import { Event, User } from '@lems/types';

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User>;
      event?: WithId<Event>;
      teamNumber?: number;
    }
  }
}
