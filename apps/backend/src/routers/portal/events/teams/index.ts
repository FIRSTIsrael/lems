import express, { Response } from 'express';
import db from '../../../../lib/database';
import { PortalTeamAtEventRequest } from '../../../../types/express';
import { attachTeam } from '../../middleware/attach-team';
import { makePortalTeamAtEventResponse } from './util';

const router = express.Router({ mergeParams: true });

router.use('/:teamNumber', attachTeam());

router.get('/:teamNumber', async (req: PortalTeamAtEventRequest, res: Response) => {
  const event = await db.events.byId(req.eventId).get();
  const team = await db.teams.byId(req.teamId).get();

  const teamRegistration = await db.teams.byId(req.teamId).isInEvent(req.eventId);
  if (!teamRegistration) {
    res.status(404).json({ error: 'Team not registered for this event' });
    return;
  }

  // Must exist, because it was returned from the DB when checking registration
  const division = await db.divisions.byId(teamRegistration).get();

  const [teamAwards, teamMatches, teamSession, rooms, tables] = await Promise.all([
    db.awards.byDivisionId(division.id).getByTeam(req.teamId),
    db.robotGameMatches.byDivisionId(division.id).getByTeam(req.teamId),
    db.judgingSessions.byDivisionId(division.id).getByTeam(req.teamId),
    db.rooms.byDivisionId(division.id).getAll(),
    db.tables.byDivisionId(division.id).getAll()
  ]);

  const teamAtEvent = makePortalTeamAtEventResponse(
    event,
    division,
    team,
    teamAwards,
    teamMatches,
    tables,
    teamSession,
    rooms
  );

  res.json(teamAtEvent);
  return;
});

export default router;
