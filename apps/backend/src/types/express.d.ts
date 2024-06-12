import { WithId } from 'mongodb';
import { FllEvent, Division, User } from '@lems/types';

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User>;
      division?: WithId<Division>;
      event?: WithId<FllEvent>;
      teamNumber?: number;
    }
  }
}
