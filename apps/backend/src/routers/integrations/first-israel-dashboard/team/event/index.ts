import express, { Response } from 'express';
import { randomAlphanumericString } from '@lems/shared/utils';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { firstIsraelDashboardEventMiddleware, teamDocumentFileValidator } from '../../middleware';
import db from '../../../../../lib/database';
import { uploadFile } from '../../../../../lib/blob-storage/upload';
import { FirstIsraelDashboardEventRequest } from '../../../../../types/express';
import exportRouter from './export';

const router = express.Router({ mergeParams: true });

router.use('/', firstIsraelDashboardEventMiddleware);

router.post(
  '/team-info',
  fileUpload({ limits: { fileSize: 15 * 1024 * 1024, files: 1 } }),
  teamDocumentFileValidator,
  async (req: FirstIsraelDashboardEventRequest, res: Response) => {
    try {
      const team = await db.teams.bySlug(req.teamSlug).get();
      if (!team) {
        res.status(400).json({ error: 'TEAM_NOT_FOUND' });
        return;
      }

      const teamDivision = await db.raw.sql
        .selectFrom('team_divisions')
        .select('profile_document_url')
        .where('team_id', '=', team.id)
        .where('division_id', '=', req.divisionId)
        .executeTakeFirst();

      if (!teamDivision) {
        res.status(400).json({ error: 'TEAM_DIVISION_NOT_FOUND' });
        return;
      }

      const documentFile = req.files.file as UploadedFile;
      if (!documentFile) {
        res.status(400).json({ error: 'NO_FILE_UPLOADED' });
        return;
      }

      const fileName = teamDivision.profile_document_url
        ? teamDivision.profile_document_url.substring(
            teamDivision.profile_document_url.lastIndexOf('/') + 1
          )
        : `${req.teamSlug}-${randomAlphanumericString(12)}`;
      const key = `events/${req.divisionId}/teams/${req.teamSlug}/${fileName}.pdf`;
      const path = await uploadFile(documentFile.data, key);
      const url = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/${key}`;
      console.log('Successfully uploaded object: ' + path);

      await db.raw.sql
        .updateTable('team_divisions')
        .set({ profile_document_url: url })
        .where('team_id', '=', team.id)
        .where('division_id', '=', req.divisionId)
        .execute();

      res.status(200).end();
    } catch (error) {
      console.error('Error updating team document:', error);
      res.status(500).json({ error: 'SERVER_ERROR' });
      return;
    }
  }
);

router.use('/export', exportRouter);

export default router;
