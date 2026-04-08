import express from 'express';
import { IntegrationTypes } from '@lems/shared/integrations';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { publishEventResults } from '../../../integrations/sendgrid/publish';
import { generateEventResultsZip } from '../../../../lib/results-download';
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

router.post('/download', async (req: AdminEventRequest, res) => {
  try {
    const settings = await db.events.byId(req.eventId).getSettings();
    if (!settings.published) {
      res.status(400).json({ error: 'Event must be published before downloading results' });
      return;
    }

    const language = (req.query.language as string) || 'en';
    console.info(
      `Starting results ZIP generation for event ${req.eventId} (language: ${language})`
    );

    const { archive, fileName, statistics } = await generateEventResultsZip(req.eventId, language);

    if (statistics.teamsWithPdfs === 0) {
      console.error(
        `CRITICAL: Event ${req.eventId} generated an empty ZIP with 0 successful PDFs. ` +
          `Total teams: ${statistics.totalTeams}, Failed PDFs: ${statistics.failedPdfs}. ` +
          `Check backend logs for PDF generation errors.`
      );
      res.status(500).json({
        error: 'Failed to generate results: no PDFs were created.'
      });
      return;
    }

    console.info(
      `Results ZIP ready for download: ${fileName} ` +
        `(${statistics.teamsWithPdfs}/${statistics.totalTeams} teams with PDFs, ${statistics.failedPdfs} failed PDFs)`
    );

    res.attachment(fileName);
    res.setHeader('Content-Type', 'application/zip');

    archive.on('error', err => {
      console.error(`Archive error while generating ${fileName}:`, err);
      // Note: Cannot send JSON response here - headers already sent
    });

    archive.pipe(res);
    await archive.finalize();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Error downloading event results for event ${req.eventId}: ${errorMessage}`,
      error
    );
    res.status(500).json({ error: `Failed to download event results: ${errorMessage}` });
  }
});

export default router;
