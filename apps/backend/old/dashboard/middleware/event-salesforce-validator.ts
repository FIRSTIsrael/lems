import { NextFunction, Request, Response } from 'express';

const eventSalesforceValidator = (req: Request, res: Response, next: NextFunction) => {
  if (req.event?.salesforceId?.toString() === req.params.eventSalesforceId) {
    return next();
  }

  res.status(403).json({ error: 'FORBIDDEN' });
};

export default eventSalesforceValidator;
