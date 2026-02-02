import express from 'express';
import { IntegrationTypes } from '@lems/shared/integrations';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { publishEventResults } from '../../../integrations/sendgrid/publish';
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
  try {
    const settings = await db.events.byId(req.eventId).getSettings();
    if (!settings.completed) {
      res.status(400).json({ error: 'Event must be completed before publishing' });
      return;
    }

    const updatedSettings = await db.events.byId(req.eventId).updateSettings({ published: true });
    if (!updatedSettings) {
      throw new Error('Failed to publish event');
    }

    // Send emails if SendGrid integration is enabled
    const integrations = await db.integrations.byEventId(req.eventId).getAll();
    const sendgridIntegration = integrations.find(
      i => i.integration_type === IntegrationTypes.SENDGRID && i.enabled
    );

    if (sendgridIntegration) {
      try {
        await publishEventResults({
          eventId: req.eventId,
          settings: sendgridIntegration.settings
        });
      } catch (error) {
        console.error('Error sending SendGrid emails:', error);
        // Don't fail the publish - log the error but continue
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

export default router;
