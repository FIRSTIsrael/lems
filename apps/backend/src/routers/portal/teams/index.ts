import express, { Response } from 'express';
import dayjs from 'dayjs';
import db from '../../../lib/database';
import { makePortalEventResponse } from '../events/util';
import { makePortalSeasonResponse } from '../seasons/util';
import { attachTeam } from '../middleware/attach-team';
import { PortalTeamRequest } from '../../../types/express';
import { makePortalTeamSummaryResponse } from './util';

const router = express.Router({ mergeParams: true });

router.use('/:teamNumber', attachTeam());

router.get('/:teamNumber/summary', async (req: PortalTeamRequest, res: Response) => {
  const team = await db.teams.byId(req.teamId).get();

  const seasons = (await db.seasons.getAll()).sort((a, b) =>
    dayjs(b.start_date).diff(a.start_date)
  );
  for (const season of seasons) {
    const events = await db.events.bySeason(season.id).getAll();
    for (const event of events) {
      const divisions = await db.divisions.byEventId(event.id).getAll();
      for (const division of divisions) {
        if (await db.teams.byId(req.teamId).isInDivision(division.id)) {
          res.status(200).json(makePortalTeamSummaryResponse(team, season.name));
          return;
        }
      }
    }
  }
  res.status(200).json(makePortalTeamSummaryResponse(team, null));
});

router.get('/:teamNumber/seasons', async (req: PortalTeamRequest, res: Response) => {
  const seasons = await db.seasons.getAll();
  const teamSeasons = [];
  for (const season of seasons) {
    const events = await db.events.bySeason(season.id).getAll();
    eventsLoop: for (const event of events) {
      const divisions = await db.divisions.byEventId(event.id).getAll();
      for (const division of divisions) {
        if (await db.teams.byId(req.teamId).isInDivision(division.id)) {
          teamSeasons.push(season);
          break eventsLoop;
        }
      }
    }
  }
  res.status(200).json(teamSeasons.map(makePortalSeasonResponse));
});

router.get(
  '/:teamNumber/seasons/:seasonSlug/results',
  async (req: PortalTeamRequest, res: Response) => {
    const { seasonSlug } = req.params;

    const season =
      seasonSlug === 'latest'
        ? await db.seasons.getCurrent()
        : await db.seasons.bySlug(seasonSlug).get();
    if (!season) {
      res.status(404).json({ message: 'Season not found' });
      return;
    }

    const events = await db.events.bySeason(season.id).getAll();
    const eventResults = [];
    for (const event of events) {
      const divisions = await db.divisions.byEventId(event.id).getAll();
      for (const division of divisions) {
        if (await db.teams.byId(req.teamId).isInDivision(division.id)) {
          const eventResult = { eventName: event.name, eventSlug: event.slug };

          const awards = await db.awards.byDivisionId(division.id).getAll();
          eventResult['awards'] = awards.filter(award => award.winner_id === req.teamId);

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

router.get(
  '/:teamNumber/seasons/:seasonSlug/events',
  async (req: PortalTeamRequest, res: Response) => {
    const { seasonSlug } = req.params;

    const season =
      seasonSlug === 'latest'
        ? await db.seasons.getCurrent()
        : await db.seasons.bySlug(seasonSlug).get();
    if (!season) {
      res.status(404).json({ message: 'Season not found' });
      return;
    }

    const events = await db.events.bySeason(season.id).getAll();
    const teamEvents = [];
    for (const event of events) {
      const divisions = await db.divisions.byEventId(event.id).getAll();
      for (const division of divisions) {
        if (await db.teams.byId(req.teamId).isInDivision(division.id)) {
          teamEvents.push(event);
          break;
        }
      }
    }

    res.status(200).json(teamEvents.map(makePortalEventResponse));
  }
);

export default router;
