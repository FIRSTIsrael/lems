import { ObjectId } from 'mongodb';
import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import * as db from '@lems/database';
import { randomAlphanumericString } from '@lems/utils/random';
import { uploadFile } from '../../../../lib/upload';

const router = express.Router({ mergeParams: true });

router.post('/team-info', fileUpload(), async (req: Request, res: Response) => {
  const team = await db.getTeam({
    divisionId: new ObjectId(req.division._id),
    number: Number(req.teamNumber)
  });
  const pdfData = (req.files.file as fileUpload.UploadedFile)?.data;
  if (!team || !pdfData) {
    res.status(400).json({ error: 'BAD_REQUEST' });
    return;
  }

  const fileName = team.profileDocumentUrl
    ? team.profileDocumentUrl.substring(team.profileDocumentUrl.lastIndexOf('/') + 1)
    : `${req.teamNumber}-${randomAlphanumericString(12)}`;
  const key = `${req.division._id}/teams/${req.teamNumber}/${fileName}.pdf`;
  const path = await uploadFile(pdfData, key);
  const url = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/${key}`;
  console.log('Successfully uploaded object: ' + path);
  await db.updateTeam(team, { ...team, profileDocumentUrl: url });
  res.json({ ok: true });
});

export default router;
