import express, { Request, Response } from 'express';
import dayjs from 'dayjs';
import db from '../../../lib/database';
import { makePortalSeasonResponse } from '../seasons/util';
import { makePortalEventResponse } from '../events/util';
import { makePortalTeamSummaryResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/:teamNumber/summary', async (req: Request, res: Response) => {
  const { teamNumber } = req.params;

  const team = await db.teams.byNumber(parseInt(teamNumber, 10)).get();
  if (!team) {
    res.status(404).json({ message: 'Team not found' });
    return;
  }

  const seasons = (await db.seasons.getAll()).sort((a, b) =>
    dayjs(b.start_date).diff(a.start_date)
  );
  for (const season of seasons) {
    const events = await db.events.bySeason(season.id).getAll();
    for (const event of events) {
      const divisions = await db.divisions.byEventId(event.id).getAll();
      for (const division of divisions) {
        if (await db.teams.byId(team.id).isInDivision(division.id)) {
          res.status(200).json(makePortalTeamSummaryResponse(team, season.name));
          return;
        }
      }
    }
  }
  res.status(200).json(makePortalTeamSummaryResponse(team, null));
});

router.get('/:teamId/seasons', async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const seasons = await db.seasons.getAll();
  const teamSeasons = [];
  for (const season of seasons) {
    const events = await db.events.bySeason(season.id).getAll();
    eventsLoop: for (const event of events) {
      const divisions = await db.divisions.byEventId(event.id).getAll();
      for (const division of divisions) {
        if (await db.teams.byId(teamId).isInDivision(division.id)) {
          teamSeasons.push(season);
          break eventsLoop;
        }
      }
    }
  }

  res.status(200).json(teamSeasons.map(makePortalSeasonResponse));
});

router.get('/:teamId/seasons/:seasonSlug/events', async (req: Request, res: Response) => {
  const { teamId, seasonSlug } = req.params;

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
      if (await db.teams.byId(teamId).isInDivision(division.id)) {
        teamEvents.push(event);
        break;
      }
    }
  }

  res.status(200).json(teamEvents.map(makePortalEventResponse));
});

export default router;
