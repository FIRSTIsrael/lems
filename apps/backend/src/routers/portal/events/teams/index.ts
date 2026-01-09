import express, { Response } from 'express';
import db from '../../../../lib/database';
import { PortalTeamAtEventRequest } from '../../../../types/express';
import { attachTeamAtEvent } from '../../middleware/attach-team-at-event';
import { makePortalAwardsResponse, makePortalDivisionResponse } from '../../divisions/util';
import { makePortalTeamResponse } from '../../teams/util';
import {
  makePortalTeamJudgingSessionResponse,
  makePortalTeamRobotGameMatchResponse,
  makeAgendaResponse
} from './util';

const router = express.Router({ mergeParams: true });

router.use('/:teamSlug', attachTeamAtEvent());

router.get('/:teamSlug', async (req: PortalTeamAtEventRequest, res: Response) => {
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

router.get('/:teamSlug/activities', async (req: PortalTeamAtEventRequest, res: Response) => {
  const session = await db.judgingSessions.byDivision(req.divisionId).getByTeam(req.teamId);
  const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();
  const matches = await db.robotGameMatches.byDivision(req.divisionId).getByTeam(req.teamId);
  const tables = await db.tables.byDivisionId(req.divisionId).getAll();
  const agendaPublic = await db.divisions.byId(req.divisionId).agenda().getAll('public');
  const agendaTeams = await db.divisions.byId(req.divisionId).agenda().getAll('teams');
  const agenda = [...agendaPublic, ...agendaTeams];

  res.json({
    session: makePortalTeamJudgingSessionResponse(req.teamId, session, rooms),
    matches: matches.map(match => makePortalTeamRobotGameMatchResponse(req.teamId, match, tables)),
    agenda: agenda.map(a => makeAgendaResponse(a))
  });
});

router.get('/:teamSlug/awards', async (req: PortalTeamAtEventRequest, res: Response) => {
  const division = await db.divisions.byId(req.divisionId).get();
  const eventSettings = await db.events.byId(division.event_id).getSettings();

  if (!eventSettings.published) {
    res.status(200).json([]);
    return;
  }

  const teamAwards = await db.awards.byDivisionId(division.id).getByTeam(req.teamId);
  res.status(200).json(teamAwards.map(makePortalAwardsResponse));
});

router.get('/:teamSlug/robot-performance', async (req: PortalTeamAtEventRequest, res: Response) => {
  const scores = [];
  const highestScore = 0;
  const robotGameRank = 1;

  res.status(200).json({
    scores,
    highestScore,
    robotGameRank
  });
});

export default router;
