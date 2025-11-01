import express, { Response } from 'express';
import db from '../../../lib/database';
import { PortalDivisionRequest } from '../../../types/express';
import { attachDivision } from '../middleware/attach-division';
import { makePortalDivisionDetailsResponse } from './util';

const router = express.Router({ mergeParams: true });

router.use(attachDivision());

router.get('/:divisionId', async (req: PortalDivisionRequest, res: Response) => {
  const divisionId = req.divisionId;
  const division = await db.divisions.byId(divisionId).get();

  const teams = await db.teams.byDivisionId(divisionId).getAll();
  const awards = await db.awards.byDivisionId(divisionId).getAll();
  const eventSettings = await db.events.byId(division.event_id).getSettings();
  const rooms = await db.rooms.byDivisionId(divisionId).getAll();
  const tables = await db.tables.byDivisionId(divisionId).getAll();
  const fieldSchedule = await db.robotGameMatches.byDivisionId(divisionId).getAll();
  const judgingSchedule = await db.judgingSessions.byDivisionId(divisionId).getAll();

  // TODO: Replace with real scoreboard data
  const scoreboard = teams.map((team, index) => ({
    teamId: team.id,
    robotGameRank: index + 1,
    maxScore: 0,
    scores: [0, 0, 0]
  }));

  res
    .status(200)
    .json(
      makePortalDivisionDetailsResponse(
        division,
        teams,
        eventSettings?.published ? awards : [],
        rooms,
        tables,
        fieldSchedule,
        judgingSchedule,
        scoreboard
      )
    );
});

export default router;
