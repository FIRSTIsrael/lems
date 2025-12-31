import express, { Response } from 'express';
import db from '../../../lib/database';
import { PortalDivisionRequest } from '../../../types/express';
import { attachDivision } from '../middleware/attach-division';
import { makePortalTeamResponse } from '../teams/util';
import {
  makePortalDivisionResponse,
  makePortalJudgingSessionResponse,
  makePortalAwardsResponse,
  makePortalMatchResponse
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

router.get('/:divisionId/scoreboard', async (req: PortalDivisionRequest, res: Response) => {
  const teams = await db.teams.byDivisionId(req.divisionId).getAll();
  const scoresheets = await db.scoresheets.byDivision(req.divisionId).byStage('RANKING').getAll();

  // Only consider submitted scoresheets for public display
  const submittedScoresheets = scoresheets.filter(s => s.status === 'submitted');

  // Group scoresheets by team
  const teamScoresMap = new Map<string, { scores: (number | null)[]; maxScore: number | null }>();

  for (const team of teams) {
    const teamScoresheets = submittedScoresheets.filter(s => s.teamId === team.id);

    // Sort by round to maintain order
    teamScoresheets.sort((a, b) => a.round - b.round);

    // Extract scores from each round
    const scores = teamScoresheets.map(s => s.data?.score ?? null);
    const validScores = scores.filter((s): s is number => s !== null);
    const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;

    teamScoresMap.set(team.id, { scores, maxScore });
  }

  // Build scoreboard entries
  const scoreboard = teams.map(team => {
    const teamScores = teamScoresMap.get(team.id) || { scores: [], maxScore: null };

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
      maxScore: teamScores.maxScore,
      scores: teamScores.scores
    };
  });

  // Sort by max score (descending), then by team number
  scoreboard.sort((a, b) => {
    if (a.maxScore === null && b.maxScore === null) return a.team.number - b.team.number;
    if (a.maxScore === null) return 1;
    if (b.maxScore === null) return -1;
    if (a.maxScore !== b.maxScore) return b.maxScore - a.maxScore;
    return a.team.number - b.team.number;
  });

  // Assign ranks (teams with same max score get same rank)
  let currentRank = 1;
  let previousMaxScore: number | null = null;
  const scoreboardWithRanks = scoreboard.map((entry, index) => {
    if (entry.maxScore !== previousMaxScore) {
      currentRank = index + 1;
      previousMaxScore = entry.maxScore;
    }

    return {
      ...entry,
      robotGameRank: entry.maxScore !== null ? currentRank : null
    };
  });

  res.status(200).json(scoreboardWithRanks);
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
