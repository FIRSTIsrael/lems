import express, { NextFunction, Response } from 'express';
import { Season } from '@lems/database';
import db from '../../../lib/database';
import { makePortalEventResponse } from '../events/util';
import { makePortalSeasonResponse } from '../seasons/util';
import { attachTeam } from '../middleware/attach-team';
import { PortalTeamRequest } from '../../../types/express';
import { makePortalTeamSummaryResponse } from './util';

const router = express.Router({ mergeParams: true });

router.use('/:teamNumber', attachTeam());

/**
 * Returns a team, as well as the latest season they competed at
 */
router.get('/:teamNumber/summary', async (req: PortalTeamRequest, res: Response) => {
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
router.get('/:teamNumber/seasons', async (req: PortalTeamRequest, res: Response) => {
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
  '/:teamNumber/events',
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
  '/:teamNumber/events/results',
  seasonFilter,
  async (req: PortalTeamWithSeasonRequest, res: Response) => {
    let teamEvents = await db.events.byTeam(req.teamId).getAllSummaries();
    teamEvents = teamEvents.filter(event => event.visible && event.published);

    if (req.seasonId) {
      teamEvents = teamEvents.filter(event => event.season_id === req.seasonId);
    }

    const eventResults = [];

    for (const event of teamEvents) {
      for (const division of event.divisions) {
        if (await db.teams.byId(req.teamId).isInDivision(division.id)) {
          const eventResult = { eventName: event.name, eventSlug: event.slug };
          const eventSettings = await db.events.byId(event.id).getSettings();

          const awards = await db.awards.byDivisionId(division.id).getAll();
          eventResult['awards'] = eventSettings.published
            ? awards.filter(award => award.winner_id === req.teamId)
            : [];

          const matches = await db.robotGameMatches.byDivisionId(division.id).getAll();
          eventResult['matches'] = matches
            .filter(
              match =>
                match.stage === 'RANKING' &&
                match.participants.some(participant => participant.team_id === req.teamId)
            )
            .map(match => ({ number: match.round, score: 0 }));

          eventResult['robotGameRank'] = 1;

          eventResults.push(eventResult);
          break;
        }
      }
    }

    res.status(200).json(eventResults);
  }
);

export default router;
