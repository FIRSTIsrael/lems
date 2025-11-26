import express from 'express';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { makeAdminSettingsResponse, makeUpdateableEventSettings } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminEventRequest, res) => {
  const settings = await db.events.byId(req.eventId).getSettings();
  res.json(makeAdminSettingsResponse(settings));
});

router.put('/', async (req: AdminEventRequest, res) => {
  const updateData = makeUpdateableEventSettings(req.body);
  const updatedSettings = await db.events.byId(req.eventId).updateSettings(updateData);
  if (!updatedSettings) {
    throw new Error('Failed to update event settings');
  }
  res.json({ success: true });
});

router.post('/complete', async (req: AdminEventRequest, res) => {
  const updatedSettings = await db.events.byId(req.eventId).updateSettings({ completed: true });
  if (!updatedSettings) {
    throw new Error('Failed to complete event');
  }
  res.json({ success: true });
});

router.post('/publish', async (req: AdminEventRequest, res) => {
  const settings = await db.events.byId(req.eventId).getSettings();
  if (!settings.completed) {
    res.json()
  }

  const updatedSettings = await db.events.byId(req.eventId).updateSettings({ published: true });
  if (!updatedSettings) {
    throw new Error('Failed to publish event');
  }
  res.json({ success: true });
});

export default router;
