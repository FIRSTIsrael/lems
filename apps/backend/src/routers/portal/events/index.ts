import express, { Request, Response } from 'express';
import { EventDetails, EventSummary } from '@lems/database';
import db from '../../../lib/database';
import { attachEvent } from '../middleware/attach-event';
import { PortalEventRequest } from '../../../types/express';
import { asHandler } from '../../../types/express-handlers';
import eventTeamRouter from './teams';
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
    const settings = await db.events.byId(event.id).getSettings();
    if (!settings) {
      res.status(404).json({ error: 'Event settings not found' });
      return;
    }

    const eventSummary: EventSummary = {
      ...event,
      divisions,
      date: event.start_date.toISOString(),
      location: event.location,
      season_id: event.season_id,
      team_count: registeredTeams.length,
      visible: settings.visible,
      published: settings.published,
      completed: settings.completed,
      official: settings.official,
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

    const events = await db.events.bySeason(season.id).getAllSummaries();

    res.json(events.filter(e => e.visible).map(makePortalEventSummaryResponse));
    return;
  }

  if (after && typeof after === 'string') {
    const timestamp = parseInt(after, 10);

    if (isNaN(timestamp)) {
      res.status(400).json({ error: 'Invalid timestamp for "after" parameter' });
      return;
    }

    const events = await db.events.after(timestamp).getAllSummaries();
    res.json(events.filter(e => e.visible).map(makePortalEventSummaryResponse));
    return;
  }

  const events = await db.events.getAllSummaries();
  res.json(events.filter(event => event.visible).map(makePortalEventSummaryResponse));
  return;
});

router.use('/:slug', attachEvent());

router.get(
  '/:slug',
  asHandler<PortalEventRequest>(async (req, res: Response) => {
    const event = await db.events.byId(req.eventId).get();
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    const divisions = await db.divisions.byEventId(event.id).getAllSummaries();
    const season = await db.seasons.byId(event.season_id).get();
    if (!season) {
      res.status(404).json({ error: 'Season not found' });
      return;
    }
    const settings = await db.events.byId(event.id).getSettings();
    if (!settings) {
      res.status(404).json({ error: 'Event settings not found' });
      return;
    }

    const eventSummary: EventDetails = {
      ...event,
      divisions,
      season_name: season.name,
      season_slug: season.slug,
      official: settings.official
    };

    res.json(makePortalEventDetailsResponse(eventSummary));
  })
);

router.use('/:slug/teams', eventTeamRouter);

export default router;
