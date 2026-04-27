import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { IntegrationTypes } from '@lems/shared/integrations';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { publishEventResults } from '../../../integrations/sendgrid/publish';
import { generateEventResultsZip } from '../../../../lib/results-download';
import { createSseEmitter } from '../../../../lib/sse';
import { storeTempFile, consumeTempFile } from '../../../../lib/temp-download-store';
import { makeAdminSettingsResponse, makeUpdateableEventSettings } from './util';

const router = express.Router({ mergeParams: true });

const downloadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const downloadFileRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', async (req: AdminEventRequest, res) => {
  const settings = await db.events.byId(req.eventId).getSettings();
  if (!settings) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

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
  const emitter = createSseEmitter(res);

  try {
    const settings = await db.events.byId(req.eventId).getSettings();
    if (!settings) {
      emitter.sendFailure('Event not found');
      return;
    }

    if (!settings.completed) {
      emitter.sendFailure('Event must be completed before publishing');
      return;
    }

    emitter.sendStart();

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
        const emailResult = await publishEventResults({
          eventId: req.eventId,
          settings: sendgridIntegration.settings,
          onProgress: (percent, message) => emitter.sendProgress(percent, message)
        });
        console.info(
          `Event ${req.eventId} published with emails sent. ` +
            `Total: ${emailResult.total}, Failed: ${emailResult.failed}`
        );
        emitter.sendSuccess({
          published: true,
          emailsSent: emailResult.total,
          emailsFailed: emailResult.failed,
          failedEmails: emailResult.failedEmails
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error sending SendGrid emails:', error);
        emitter.sendFailure(`Failed to send emails: ${message}`);
      }
    } else {
      console.info(`Event ${req.eventId} published`);
      emitter.sendSuccess({
        published: true,
        emailsSent: 0,
        emailsFailed: 0
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error publishing event ${req.eventId}: ${message}`, error);
    emitter.sendFailure(`Failed to publish event: ${message}`);
  }
});

router.post('/download', downloadRateLimiter, async (req: AdminEventRequest, res) => {
  const emitter = createSseEmitter(res);
  let tempPath: string | undefined;
  let fileStream: fs.WriteStream | undefined;
  let archive:
    | (NodeJS.ReadableStream & {
        on(event: 'error', listener: (error: Error) => void): unknown;
        pipe<T extends NodeJS.WritableStream>(destination: T): T;
        finalize(): unknown;
        destroy?: (error?: Error) => void;
      })
    | undefined;

  try {
    const settings = await db.events.byId(req.eventId).getSettings();
    if (!settings) {
      emitter.sendFailure('Event not found');
      return;
    }

    if (!settings.published) {
      emitter.sendFailure('Event must be published before downloading results');
      return;
    }

    const language = (req.query.language as string) || 'en';
    console.info(
      `Starting results ZIP generation for event ${req.eventId} (language: ${language})`
    );

    emitter.sendStart();

    const result = await generateEventResultsZip(
      req.eventId,
      language,
      percent => emitter.sendProgress(percent)
    );
    archive = result.archive;
    const { fileName, statistics } = result;

    if (statistics.teamsWithPdfs === 0) {
      console.error(
        `CRITICAL: Event ${req.eventId} generated an empty ZIP with 0 successful PDFs. ` +
          `Total teams: ${statistics.totalTeams}, Failed PDFs: ${statistics.failedPdfs}.`
      );
      emitter.sendFailure('Failed to generate results: no PDFs were created.');
      return;
    }

    console.info(
      `Results ZIP ready: ${fileName} ` +
        `(${statistics.teamsWithPdfs}/${statistics.totalTeams} teams with PDFs, ${statistics.failedPdfs} failed PDFs)`
    );

    tempPath = path.join(os.tmpdir(), `${crypto.randomUUID()}.zip`);
    fileStream = fs.createWriteStream(tempPath);

    await new Promise<void>((resolve, reject) => {
      fileStream!.on('finish', resolve);
      fileStream!.on('error', reject);
      archive!.on('error', reject);
      archive!.pipe(fileStream!);
      archive!.finalize();
    });

    const token = storeTempFile(tempPath, fileName);
    emitter.sendSuccess({ token });
  } catch (error) {
    archive?.destroy?.(error instanceof Error ? error : undefined);
    fileStream?.destroy(error instanceof Error ? error : undefined);

    if (tempPath) {
      try {
        await fs.promises.unlink(tempPath);
      } catch (unlinkError) {
        if ((unlinkError as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.error(
            `Failed to clean up temporary results ZIP for event ${req.eventId}: ${tempPath}`,
            unlinkError
          );
        }
      }
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error downloading event results for event ${req.eventId}: ${message}`, error);
    emitter.sendFailure(`Failed to download event results: ${message}`);
  }
});

router.get('/download/file', downloadFileRateLimiter, (req: AdminEventRequest, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  const entry = consumeTempFile(token);
  if (!entry) {
    res.status(404).json({ error: 'Token not found or expired' });
    return;
  }

  res.download(entry.filePath, entry.fileName, () => {
    fs.unlink(entry.filePath, () => {});
  });
});

export default router;
