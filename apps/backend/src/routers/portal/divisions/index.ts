import express, { Response } from 'express';
import db from '../../../lib/database';
import { PortalDivisionRequest } from '../../../types/express';
import { attachDivision } from '../middleware/attach-division';
import { makePortalTeamResponse } from '../teams/util';
import { calculateRobotGameRankings } from '../utils/ranking-calculator';
import {
  makePortalDivisionResponse,
  makePortalJudgingSessionResponse,
  makePortalAwardsResponse,
  makePortalMatchResponse,
  makePortalAgendaResponse
} from './util';

const router = express.Router({ mergeParams: true });

router.use('/:divisionId', attachDivision());

router.get('/:divisionId', async (req: PortalDivisionRequest, res: Response) => {
  const division = await db.divisions.byId(req.divisionId).get();
  res.status(200).json(makePortalDivisionResponse(division));
});

router.get('/:divisionId/teams', async (req: PortalDivisionRequest, res: Response) => {
  const divisionId = req.divisionId;
  const teams = await db.teams.byDivisionId(divisionId).getAll();
  res.status(200).json(teams.map(makePortalTeamResponse));
});

router.get('/:divisionId/schedule/judging', async (req: PortalDivisionRequest, res: Response) => {
  const teams = await db.teams.byDivisionId(req.divisionId).getAll();
  const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();
  const judgingSchedule = await db.judgingSessions.byDivision(req.divisionId).getAll();

  const sessions = judgingSchedule.map(session =>
    makePortalJudgingSessionResponse(session, rooms, teams)
  );
  res.status(200).json(sessions);
});

router.get('/:divisionId/schedule/field', async (req: PortalDivisionRequest, res: Response) => {
  const teams = await db.teams.byDivisionId(req.divisionId).getAll();
  const tables = await db.tables.byDivisionId(req.divisionId).getAll();
  const fieldSchedule = await db.robotGameMatches.byDivision(req.divisionId).getAll();

  const matches = fieldSchedule.map(match => makePortalMatchResponse(match, tables, teams));
  res.status(200).json(matches);
});

router.get('/:divisionId/agenda', async (req: PortalDivisionRequest, res: Response) => {
  const agendaPublic = await db.divisions.byId(req.divisionId).agenda().getAll('public');
  const agendaTeams = await db.divisions.byId(req.divisionId).agenda().getAll('teams');
  const agenda = [...agendaPublic, ...agendaTeams].sort(
    (a, b) => a.start_time.getTime() - b.start_time.getTime()
  );

  res.status(200).json(agenda.map(makePortalAgendaResponse));
});

// TODO: Implement this properly
router.get('/:divisionId/scoreboard', async (req: PortalDivisionRequest, res: Response) => {
  const teams = await db.teams.byDivisionId(req.divisionId).getAll();

  const rankings = await calculateRobotGameRankings(req.divisionId);

  const scoreboard = teams.map(team => {
    const rankingData = rankings.get(team.id);

    const scores =
      rankingData?.scoresWithRounds.sort((a, b) => a.round - b.round).map(s => s.score) ?? [];

    return {
      team: {
        id: team.id,
        name: team.name,
        number: team.number,
        affiliation: team.affiliation,
        city: team.city,
        region: team.region,
        slug: `${team.region}-${team.number}`.toUpperCase()
      },
      robotGameRank: rankingData?.rank ?? null,
      maxScore: rankingData?.maxScore ?? null,
      scores: scores.length > 0 ? scores : null
    };
  });

  res.status(200).json(scoreboard);
});

router.get('/:divisionId/awards', async (req: PortalDivisionRequest, res: Response) => {
  const division = await db.divisions.byId(req.divisionId).get();
  const eventSettings = await db.events.byId(division.event_id).getSettings();

  if (!eventSettings?.published) {
    res.status(200).json(null);
    return;
  }

  const awards = await db.awards.byDivisionId(req.divisionId).getAll();
  res.status(200).json(awards.map(makePortalAwardsResponse));
});

export default router;
