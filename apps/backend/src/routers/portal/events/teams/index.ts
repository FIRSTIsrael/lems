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
  const scoresheets = await db.scoresheets
    .byDivision(req.divisionId)
    .byTeamId(req.teamId)
    .byStage('RANKING')
    .getAll();

  // Only consider submitted scoresheets for public display
  const submittedScoresheets = scoresheets.filter(s => s.status === 'submitted');

  // Sort by round to maintain order
  submittedScoresheets.sort((a, b) => a.round - b.round);

  // Extract scores (use null for rounds without submitted scoresheets)
  const scores = submittedScoresheets.map(s => s.data?.score ?? null);
  const validScores = scores.filter((s): s is number => s !== null);
  const highestScore = validScores.length > 0 ? Math.max(...validScores) : null;

  // Calculate robot game rank if there's a valid score
  let robotGameRank: number | null = null;
  if (highestScore !== null) {
    // Get all teams in the division
    const teams = await db.teams.byDivisionId(req.divisionId).getAll();
    const allScoresheets = await db.scoresheets
      .byDivision(req.divisionId)
      .byStage('RANKING')
      .getAll();

    const allSubmittedScoresheets = allScoresheets.filter(s => s.status === 'submitted');

    // Calculate max score for each team
    const teamMaxScores = teams
      .map(team => {
        const teamScores = allSubmittedScoresheets
          .filter(s => s.teamId === team.id)
          .map(s => s.data?.score ?? null)
          .filter((s): s is number => s !== null);

        return {
          teamId: team.id,
          maxScore: teamScores.length > 0 ? Math.max(...teamScores) : null
        };
      })
      .filter(t => t.maxScore !== null)
      .sort((a, b) => (b.maxScore as number) - (a.maxScore as number));

    // Find rank (teams with same score get same rank)
    const currentTeamIndex = teamMaxScores.findIndex(t => t.teamId === req.teamId);
    if (currentTeamIndex !== -1) {
      // Count how many teams have a better score
      let rank = 1;
      for (let i = 0; i < currentTeamIndex; i++) {
        if (teamMaxScores[i].maxScore !== highestScore) {
          rank = i + 1;
        }
      }
      robotGameRank = rank;
    }
  }

  res.status(200).json({
    scores,
    highestScore,
    robotGameRank
  });
});

export default router;
