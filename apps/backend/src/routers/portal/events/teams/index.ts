import express, { Response } from 'express';
import db from '../../../../lib/database';
import { PortalTeamAtEventRequest } from '../../../../types/express';
import { attachTeamAtEvent } from '../../middleware/attach-team-at-event';
import { makePortalAwardsResponse, makePortalDivisionResponse } from '../../divisions/util';
import { makePortalTeamResponse } from '../../teams/util';
import { makePortalTeamJudgingSessionResponse, makePortalTeamRobotGameMatchResponse } from './util';

const router = express.Router({ mergeParams: true });

router.use('/:teamNumber', attachTeamAtEvent());

router.get('/:teamNumber', async (req: PortalTeamAtEventRequest, res: Response) => {
  const team = await db.teams.byId(req.teamId).get();
  const division = await db.divisions.byId(req.divisionId).get();
  const event = await db.events.byId(division.event_id).get();

  res.json({
    team: makePortalTeamResponse(team),
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug
    },
    division: makePortalDivisionResponse(division)
  });
});

router.get('/:teamNumber/activities', async (req: PortalTeamAtEventRequest, res: Response) => {
  const session = await db.judgingSessions.byDivisionId(req.divisionId).getByTeam(req.teamId);
  const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();
  const matches = await db.robotGameMatches.byDivisionId(req.divisionId).getByTeam(req.teamId);
  const tables = await db.tables.byDivisionId(req.divisionId).getAll();

  res.json({
    session: makePortalTeamJudgingSessionResponse(req.teamId, session, rooms),
    matches: matches.map(match => makePortalTeamRobotGameMatchResponse(req.teamId, match, tables))
  });
});

router.get('/:teamNumber/awards', async (req: PortalTeamAtEventRequest, res: Response) => {
  const division = await db.divisions.byId(req.divisionId).get();
  const eventSettings = await db.events.byId(division.event_id).getSettings();

  if (!eventSettings.published) {
    res.status(200).json([]);
    return;
  }

  const teamAwards = await db.awards.byDivisionId(division.id).getByTeam(req.teamId);
  res.status(200).json(teamAwards.map(makePortalAwardsResponse));
});

router.get(
  '/:teamNumber/robot-performance',
  async (req: PortalTeamAtEventRequest, res: Response) => {
    const scores = [];
    const highestScore = 0;
    const robotGameRank = 1;

    res.status(200).json({
      scores,
      highestScore,
      robotGameRank
    });
  }
);

export default router;
