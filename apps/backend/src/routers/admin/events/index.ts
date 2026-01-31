import express from 'express';
import { UpdateableEvent } from '@lems/database';
import db from '../../../lib/database';
import { attachEvent } from '../middleware/attach-event';
import { requirePermission } from '../middleware/require-permission';
import { AdminEventRequest, AdminRequest } from '../../../types/express';
import { makeAdminEventResponse, makeAdminEventSummaryResponse } from './util';
import eventUsersRouter from './users';
import eventTeamsRouter from './teams';
import eventDivisionsRouter from './divisions';
import eventSettingsRouter from './settings';
import eventIntegrationsRouter from './integrations';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminEventRequest, res) => {
  const events = await db.events.getAll();
  res.json(events.map(event => makeAdminEventResponse(event)));
});

router.get('/me', async (req: AdminRequest, res) => {
  const events = await db.admins.byId(req.userId).getEvents();
  res.json(events.map(event => makeAdminEventResponse(event)));
});

router.get('/slug/:slug', async (req, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  res.json(makeAdminEventResponse(event));
});

router.get('/season/:seasonId', async (req, res) => {
  const events = await db.events.bySeason(req.params.seasonId).getAll();
  res.json(events);
});

router.get('/season/:seasonId/summary', async (req, res) => {
  const events = await db.events.bySeason(req.params.seasonId).getAllSummaries();
  res.json(events.map(event => makeAdminEventSummaryResponse(event)));
});

router.post('/', requirePermission('MANAGE_EVENTS'), async (req: AdminRequest, res) => {
  try {
    const { name, slug, date, location, region, divisions } = req.body;

    if (!name || !slug || !date || !location || !region) {
      res.status(400).json({ error: 'Name, slug, date, location, and region are required' });
      return;
    }

    if (typeof region !== 'string' || region.length !== 2 || !/^[A-Z]{2}$/.test(region)) {
      res.status(400).json({ error: 'Region must be a 2-letter ISO 3166-1 alpha-2 country code' });
      return;
    }

    if (!Array.isArray(divisions) || divisions.length === 0) {
      res.status(400).json({ error: 'At least one division is required' });
      return;
    }

    if (divisions.length > 1) {
      for (const division of divisions) {
        if (!division.name || !division.color) {
          res.status(400).json({ error: 'Each division must have a name and color' });
          return;
        }
      }
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      res
        .status(400)
        .json({ error: 'Invalid slug format. Use lowercase letters, numbers, and dashes only' });
      return;
    }

    const existingEvent = await db.events.bySlug(slug).get();
    if (existingEvent) {
      res.status(409).json({ error: 'Event with this slug already exists' });
      return;
    }

    const currentSeason = await db.seasons.getCurrent();
    if (!currentSeason) {
      res
        .status(400)
        .json({ error: 'No current season found. A season must be active to create an event.' });
      return;
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const eventResult = await db.events.create({
      name,
      slug,
      start_date: eventDate,
      end_date: eventDate, // For now, using same date for start and end
      location,
      region,
      season_id: currentSeason.id
    });

    if (!eventResult) {
      res.status(500).json({ error: 'Failed to create event' });
      return;
    }

    await db.events.byId(eventResult.id).addAdmin(req.userId);

    const divisionsResult = await db.divisions.createMany(
      divisions.map(division => ({
        name: division.name,
        color: division.color,
        event_id: eventResult.id
      }))
    );

    if (!divisionsResult || divisionsResult.length === 0) {
      res.status(500).json({ error: 'Failed to create divisions' });
      return;
    }

    res.status(201).end();
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.use('/:eventId', attachEvent());

router.use('/:eventId/divisions', eventDivisionsRouter);
router.use('/:eventId/teams', eventTeamsRouter);
router.use('/:eventId/users', eventUsersRouter);
router.use('/:eventId/settings', eventSettingsRouter);
router.use('/:eventId/integrations', eventIntegrationsRouter);

router.get('/:eventId', async (req: AdminEventRequest, res) => {
  const event = await db.events.byId(req.eventId).get();
  res.json(makeAdminEventResponse(event));
});

router.put('/:eventId', requirePermission('MANAGE_EVENTS'), async (req: AdminRequest, res) => {
  try {
    const { slug } = req.params;
    const { name, date, location, region } = req.body;

    const existingEvent = await db.events.bySlug(slug).get();
    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const updateData: Partial<UpdateableEvent> = {};

    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({ error: 'Name cannot be empty' });
        return;
      }
      updateData.name = name;
    }

    if (date !== undefined) {
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }
      updateData.start_date = eventDate;
      updateData.end_date = eventDate; // For now, using same date for start and end
    }

    if (location !== undefined) {
      if (!location.trim()) {
        res.status(400).json({ error: 'Location cannot be empty' });
        return;
      }
      updateData.location = location;
    }

    if (region !== undefined) {
      if (typeof region !== 'string' || region.length !== 2 || !/^[A-Z]{2}$/.test(region)) {
        res
          .status(400)
          .json({ error: 'Region must be a 2-letter ISO 3166-1 alpha-2 country code' });
        return;
      }
      updateData.region = region;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const updatedEvent = await db.events.bySlug(slug).update(updateData);

    if (!updatedEvent) {
      res.status(500).json({ error: 'Failed to update event' });
      return;
    }

    res.status(200).end();
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
