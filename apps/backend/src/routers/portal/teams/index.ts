import express, { Request, NextFunction, Response } from 'express';
import { Season } from '@lems/database';
import { TeamEventResult } from '@lems/types/api/portal';
import db from '../../../lib/database';
import { makePortalEventResponse } from '../events/util';
import { makePortalSeasonResponse } from '../seasons/util';
import { attachTeam } from '../middleware/attach-team';
import { PortalTeamRequest } from '../../../types/express';
import { getTeamRankingData } from '../utils/ranking-calculator';
import { makePortalTeamResponse, makePortalTeamSummaryResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const { page } = req.params;

  const numberOfPages = await db.teams.numberOfPages();

  if (!page) {
    const teams = await db.teams.getAll();
    res.status(200).json({ teams: teams.map(makePortalTeamResponse), numberOfPages });
    return;
  }

  const pageNumber = parseInt(page, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    res.status(400).json({ error: 'Invalid page number' });
    return;
  }

  const teams = await db.teams.getPage(pageNumber);
  res.status(200).json({ teams: teams.map(makePortalTeamResponse), numberOfPages });
});

router.use('/:teamSlug', attachTeam());

/**
 * Returns a team, as well as the latest season they competed at
 */
router.get('/:teamSlug/summary', async (req: PortalTeamRequest, res: Response) => {
  const team = await db.teams.byId(req.teamId).get();

  const teamEvents = await db.events.byTeam(req.teamId).getAllSummaries();
  const seasons = await db.seasons.getAll(); // Sorted by default

  for (const season of seasons) {
    if (teamEvents.some(event => event.season_id === season.id)) {
      const seasonResponse = makePortalSeasonResponse(season);

      res.status(200).json(makePortalTeamSummaryResponse(team, seasonResponse));
      return;
    }
  }

  res.status(200).json(makePortalTeamSummaryResponse(team, null));
});

/**
 * Returns the seasons a team competed at
 */
router.get('/:teamSlug/seasons', async (req: PortalTeamRequest, res: Response) => {
  const seasons = await db.seasons.getAll();
  const teamSeasons = new Set();

  const teamEvents = await db.events.byTeam(req.teamId).getAllSummaries();

  for (const event of teamEvents) {
    if (!event.visible) continue;

    if (!teamSeasons.has(event.season_id)) {
      teamSeasons.add(event.season_id);
    }
  }

  const filteredSeasons = seasons.filter(season => teamSeasons.has(season.id));
  res.status(200).json(filteredSeasons.map(makePortalSeasonResponse));
});

type PortalTeamWithSeasonRequest = PortalTeamRequest & { seasonId?: string };

const seasonFilter = async (
  req: PortalTeamWithSeasonRequest,
  res: Response,
  next: NextFunction
) => {
  const { season: seasonSlug } = req.query;

  let season: Season | null = null;
  if (seasonSlug && typeof seasonSlug === 'string') {
    if (seasonSlug === 'latest') {
      season = await db.seasons.getCurrent();
    } else {
      season = await db.seasons.bySlug(seasonSlug).get();
      if (!season) {
        res.status(404).json({ message: 'Season not found' });
        return;
      }
    }
  }

  req.seasonId = season ? season.id : undefined;
  next();
};

/**
 * Returns the events a team has competed at, optionally filtered by season
 */
router.get(
  '/:teamSlug/events',
  seasonFilter,
  async (req: PortalTeamRequest & { seasonId?: string }, res: Response) => {
    let teamEvents = await db.events.byTeam(req.teamId).getAllSummaries();
    teamEvents = teamEvents.filter(event => event.visible);

    if (req.seasonId) {
      teamEvents = teamEvents.filter(event => event.season_id === req.seasonId);
    }

    res.status(200).json(teamEvents.map(makePortalEventResponse));
  }
);

/**
 * Returns the event results for a team, optionally filtered by season
 */
router.get(
  '/:teamSlug/events/results',
  seasonFilter,
  async (req: PortalTeamWithSeasonRequest, res: Response) => {
    let teamEvents = await db.events.byTeam(req.teamId).getAllSummaries();
    teamEvents = teamEvents.filter(event => event.visible);

    if (req.seasonId) {
      teamEvents = teamEvents.filter(event => event.season_id === req.seasonId);
    }

    const eventResults: TeamEventResult[] = [];

    for (const event of teamEvents) {
      const eventResult: TeamEventResult = {
        eventName: event.name,
        eventSlug: event.slug,
        eventDate: event.date,
        published: event.published,
        results: null
      };

      if (!event.published) {
        eventResults.push(eventResult);
        continue;
      }

      // TODO: This isn't the most efficient way to check division registration,
      // we should improve this sometime by batch-requesting
      const teamDivision = await db.teams.byId(req.teamId).isInEvent(event.id);

      const awards = await db.awards.byDivisionId(teamDivision).getAll();
      const teamAwards = awards.filter(award => award.winner_id === req.teamId);

      const matches = await db.robotGameMatches.byDivision(teamDivision).getByTeam(req.teamId);
      const rankingMatches = matches.filter(match => match.stage === 'RANKING');

      const scoresheets = await db.scoresheets
        .byDivision(teamDivision)
        .byTeamId(req.teamId)
        .byStage('RANKING')
        .getAll();

      const submittedScoresheets = scoresheets.filter(
        s => s.status === 'submitted' && s.data?.score != null
      );

      const scoresByRound = new Map<number, number>();
      for (const sheet of submittedScoresheets) {
        scoresByRound.set(sheet.round, sheet.data.score);
      }

      const teamMatchResults = rankingMatches.map(match => ({
        number: match.round,
        score: scoresByRound.get(match.round) ?? null
      }));

      const rankingData = await getTeamRankingData(teamDivision, req.teamId);
      const robotGameRank = rankingData?.rank ?? null;

      eventResult.results = {
        awards: teamAwards.map(award => ({
          name: award.name,
          place: award.place || null
        })),
        matches: teamMatchResults,
        robotGameRank
      };

      eventResults.push(eventResult);
    }

    res.status(200).json(eventResults);
  }
);

export default router;
