import { NextFunction, Request, Response } from 'express';

const teamValidator = (req: Request, res: Response, next: NextFunction) => {
  const teamNumber = Number(req.params.teamNumber);
  if (isNaN(teamNumber)) {
    res.status(400).json({ error: 'INVALID_TEAM_NUMBER' });
    return;
  }

  if (req.teamNumber === teamNumber) {
    return next();
  }

  res.status(403).json({ error: 'FORBIDDEN' });
};

export default teamValidator;
