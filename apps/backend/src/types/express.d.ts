import { WithId } from 'mongodb';
import { User } from '@lems/types';

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User>;
    }
  }
}
