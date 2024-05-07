import { WithId } from 'mongodb';
import { Division, User } from '@lems/types';

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User>;
      division?: WithId<Division>;
      teamNumber?: number;
    }
  }
}
