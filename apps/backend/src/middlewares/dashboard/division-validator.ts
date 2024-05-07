import { NextFunction, Request, Response } from 'express';

const divisionValidator = (req: Request, res: Response, next: NextFunction) => {
  if (req.division?.salesforceId?.toString() === req.params.divisionSalesforceId) {
    return next();
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
};

export default divisionValidator;
