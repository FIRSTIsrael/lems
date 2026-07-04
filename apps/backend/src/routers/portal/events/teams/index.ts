import express, { Response } from 'express';
import db from '../../../../lib/database';
import { PortalTeamAtEventRequest } from '../../../../types/express';
import { attachTeamAtEvent } from '../../middleware/attach-team-at-event';
import { makePortalAwardsResponse, makePortalDivisionResponse } from '../../divisions/util';
import { makePortalTeamResponse } from '../../teams/util';
import { getTeamRankingData } from '../../utils/ranking-calculator';
import { asHandler } from '../../../../types/express-handlers';
import {
  makePortalTeamJudgingSessionResponse,
  makePortalTeamRobotGameMatchResponse,
  makeAgendaResponse
} from './util';

const router = express.Router({ mergeParams: true });

router.use('/:teamSlug', attachTeamAtEvent());

router.get(
  '/:teamSlug',
  asHandler<PortalTeamAtEventRequest>(async (req, res: Response) => {
    const team = await db.teams.byId(req.teamId).get();
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }
    const event = await db.events.byId(division.event_id).get();
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({
      team: makePortalTeamResponse(team),
      event: {
        id: event.id,
        name: event.name,
        slug: event.slug
      },
      division: makePortalDivisionResponse(division)
    });
  })
);

router.get(
  '/:teamSlug/activities',
  asHandler<PortalTeamAtEventRequest>(async (req, res: Response) => {
    const session = await db.judgingSessions.byDivision(req.divisionId).getByTeam(req.teamId);
    const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();
    const matches = await db.robotGameMatches.byDivision(req.divisionId).getByTeam(req.teamId);
    const tables = await db.tables.byDivisionId(req.divisionId).getAll();
    const agendaPublic = await db.divisions.byId(req.divisionId).agenda().getAll('public');
    const agendaTeams = await db.divisions.byId(req.divisionId).agenda().getAll('teams');
    const agenda = [...agendaPublic, ...agendaTeams];

    res.json({
      session: session ? makePortalTeamJudgingSessionResponse(req.teamId, session, rooms) : null,
      matches: matches.map(match =>
        makePortalTeamRobotGameMatchResponse(req.teamId, match, tables)
      ),
      agenda: agenda.map(a => makeAgendaResponse(a))
    });
  })
);

router.get(
  '/:teamSlug/awards',
  asHandler<PortalTeamAtEventRequest>(async (req, res: Response) => {
    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }
    const eventSettings = await db.events.byId(division.event_id).getSettings();

    if (!eventSettings?.published) {
      res.status(200).json([]);
      return;
    }

    const teamAwards = await db.awards.byDivisionId(division.id).getByTeam(req.teamId);
    res.status(200).json(teamAwards.map(makePortalAwardsResponse));
  })
);

router.get(
  '/:teamSlug/robot-performance',
  asHandler<PortalTeamAtEventRequest>(async (req, res: Response) => {
    const rankingData = await getTeamRankingData(req.divisionId, req.teamId);

    if (!rankingData) {
      res.status(200).json({
        scores: [],
        highestScore: null,
        robotGameRank: null
      });
      return;
    }

    const sortedScores = rankingData.scoresWithRounds
      .sort((a, b) => a.round - b.round)
      .map(s => s.score);

    res.status(200).json({
      scores: sortedScores,
      highestScore: rankingData.maxScore,
      robotGameRank: rankingData.rank
    });
  })
);

export default router;
