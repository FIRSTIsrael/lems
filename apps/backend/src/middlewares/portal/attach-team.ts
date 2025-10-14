import { NextFunction, Request, Response } from 'express';
import { PortalTeamRequest } from '../../types/express';
import database from '../../lib/database';

/**
 * Middleware to attach the team to the request.
 * If the team is not found, a 404 error is returned.
 */
export const attachTeam = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teamNumber = req.params.teamNumber;

      if (!teamNumber) {
        res.status(400).json({ error: 'TEAM_NUMBER_REQUIRED' });
        return;
      }

      const team = await database.teams.byNumber(parseInt(teamNumber, 10)).get();

      if (!team) {
        res.status(404).json({ error: 'TEAM_NOT_FOUND' });
        return;
      }

      (req as PortalTeamRequest).teamId = team.id;

      next();
    } catch (error) {
      console.error('Error attaching team:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};
