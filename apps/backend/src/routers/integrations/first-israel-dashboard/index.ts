import express, { Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';
import db from '../../../lib/database';
import { FirstIsraelDashboardRequest } from '../../../types/express';
import { teamLogoFileValidator, firstIsraelDashboardTeamMiddleware } from './middleware';
import eventRouter from './team/event';

const router = express.Router({ mergeParams: true });

router.use('/team', firstIsraelDashboardTeamMiddleware);

router.post(
  '/team/logo',
  fileUpload({ limits: { fileSize: 200 * 1024, files: 1 } }),
  teamLogoFileValidator,
  async (req: FirstIsraelDashboardRequest, res: Response) => {
    if (!req.files || !req.files.file) {
      res.status(400).json({ error: 'NO_FILE_UPLOADED' });
      return;
    }

    const logoFile = req.files.file as UploadedFile;

    const metadata = await sharp(logoFile.data).metadata();
    if (metadata.width !== 256 || metadata.height !== 256) {
      res.status(400).json({ error: 'INVALID_IMAGE_DIMENSIONS' });
      return;
    }

    try {
      await db.teams.bySlug(req.teamSlug).updateLogo(logoFile.data);
    } catch (error) {
      console.error('Error updating team logo:', error);
      res.status(500).json({ error: 'SERVER_ERROR' });
      return;
    }

    res.status(200).end();
  }
);

router.use('/team/event', eventRouter);

export default router;
