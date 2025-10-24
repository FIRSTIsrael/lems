import express, { Request, Response } from 'express';
import { EventDetails, EventSummary } from '@lems/database';
import db from '../../../lib/database';
import { loadEvent } from '../../../middlewares/portal/load-event';
import { makePortalEventDetailsResponse, makePortalEventSummaryResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const { after, season: seasonSlug, event: eventSlug } = req.query;

  if (eventSlug && typeof eventSlug === 'string') {
    const event = await db.events.bySlug(eventSlug).get();

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const registeredTeams = await db.events.bySlug(eventSlug).getRegisteredTeams();
    const divisions = await db.divisions.byEventId(event.id).getAll();

    const eventSummary: EventSummary = {
      ...event,
      divisions,
      date: event.start_date.toISOString(),
      location: event.location,
      season_id: event.season_id,
      team_count: registeredTeams.length,
      is_fully_set_up: false,
      assigned_admin_ids: []
    };

    res.json([makePortalEventSummaryResponse(eventSummary)]);
    return;
  }

  if (seasonSlug && typeof seasonSlug === 'string') {
    const season = await db.seasons.bySlug(seasonSlug).get();

    if (!season) {
      res.status(400).json({ error: 'Invalid season slug' });
      return;
    }

    const events = await db.events.bySeason(season.id).getAllSummaries(true);
    res.json(events.map(makePortalEventSummaryResponse));
    return;
  }

  if (after && typeof after === 'string') {
    const timestamp = parseInt(after, 10);

    if (isNaN(timestamp)) {
      res.status(400).json({ error: 'Invalid timestamp for "after" parameter' });
      return;
    }

    const events = await db.events.after(timestamp).getAllSummaries(true);
    res.json(events.map(makePortalEventSummaryResponse));
    return;
  }

  const allEvents = await db.events.getAll();

  const events: EventSummary[] = await Promise.all(
    allEvents.map(async event => {
      const registeredTeams = await db.events.byId(event.id).getRegisteredTeams();
      const divisions = await db.divisions.byEventId(event.id).getAll();

      return {
        ...event,
        divisions,
        date: event.start_date.toISOString(),
        team_count: registeredTeams.length,
        is_fully_set_up: false,
        assigned_admin_ids: []
      };
    })
  );

  res.json(events.map(makePortalEventSummaryResponse));
  return;
});

router.use('/:slug', loadEvent());
router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;

  const event = await db.events.bySlug(slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const divisions = await db.divisions.byEventId(event.id).getAllSummaries();
  const season = await db.seasons.byId(event.season_id).get();

  const eventSummary: EventDetails = {
    ...event,
    divisions,
    season_name: season.name,
    season_slug: season.slug
  };

  res.json(makePortalEventDetailsResponse(eventSummary));
});

export default router;
