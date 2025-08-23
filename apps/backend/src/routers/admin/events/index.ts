import express from 'express';
import { UpdateableEvent } from '@lems/database';
import db from '../../../lib/database';
import { requirePermission } from '../../../middlewares/admin/require-permission';
import { AdminRequest } from '../../../types/express';
import { makeAdminEventResponse } from './util';
import eventTeamsRouter from './teams/index';
import eventDivisionsRouter from './divisions/index';

const router = express.Router({ mergeParams: true });

router.use('/:slug/divisions', eventDivisionsRouter);
router.use('/:slug/teams', eventTeamsRouter);

router.post('/', requirePermission('MANAGE_EVENTS'), async (req: AdminRequest, res) => {
  try {
    const { name, slug, date, location, divisions } = req.body;

    if (!name || !slug || !date || !location) {
      res.status(400).json({ error: 'Name, slug, date, and location are required' });
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

    res.status(201).json({
      message: 'Event created successfully',
      event: eventResult,
      divisions: divisionsResult
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:slug', requirePermission('MANAGE_EVENTS'), async (req: AdminRequest, res) => {
  try {
    const { slug } = req.params;
    const { name, date, location } = req.body;

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

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const updatedEvent = await db.events.bySlug(slug).update(updateData);

    if (!updatedEvent) {
      res.status(500).json({ error: 'Failed to update event' });
      return;
    }

    res.json({
      message: 'Event updated successfully',
      event: makeAdminEventResponse(updatedEvent)
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  const events = await db.events.getAll();
  res.json(events.map(event => makeAdminEventResponse(event)));
});

router.get('/:slug', async (req, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  res.json(makeAdminEventResponse(event));
});

router.get('/id/:id', async (req, res) => {
  const event = await db.events.byId(req.params.id).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  res.json(makeAdminEventResponse(event));
});

router.get('/season/:id', async (req, res) => {
  const events = await db.seasons.byId(req.params.id).getEvents();
  res.json(events);
});

router.get('/season/:id/summary', async (req, res) => {
  const events = await db.seasons.byId(req.params.id).getSummarizedEvents();
  res.json(events);
});

export default router;
