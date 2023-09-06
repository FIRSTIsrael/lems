import { Express } from 'express-serve-static-core';
import { User } from '@lems/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
