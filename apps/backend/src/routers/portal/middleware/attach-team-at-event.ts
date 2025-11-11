import { NextFunction, Request, Response } from 'express';
import { PortalTeamAtEventRequest } from '../../../types/express';
import database from '../../../lib/database';

/**
 * Middleware to attach the team to the request.
 * If the team is not found, a 404 error is returned.
 */
export const attachTeamAtEvent = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventSlug = req.params.slug;

      if (!eventSlug) {
        res.status(400).json({ error: 'EVENT_SLUG_REQUIRED' });
        return;
      }

      const event = await database.events.bySlug(eventSlug).get();

      if (!event) {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

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

      const teamRegistration = await database.teams.byId(team.id).isInEvent(event.id);

      if (!teamRegistration) {
        res.status(404).json({ error: 'TEAM_NOT_REGISTERED_FOR_EVENT' });
        return;
      }

      (req as PortalTeamAtEventRequest).teamId = team.id;
      (req as PortalTeamAtEventRequest).divisionId = teamRegistration;

      next();
    } catch (error) {
      console.error('Error attaching team at event:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};
