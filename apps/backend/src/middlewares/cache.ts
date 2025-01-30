import { Request, Response, NextFunction } from 'express';

export const cache = (durationInSeconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${durationInSeconds}`);
    res.set('Last-Modified', new Date().toUTCString());
    next();
  };
};
