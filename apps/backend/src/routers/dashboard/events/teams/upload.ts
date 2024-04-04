import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fileUpload from 'express-fileupload';
import { uploadFile } from '../../../../lib/upload';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';
import { randomAlphanumericString } from '@lems/utils/random';

const router = express.Router({ mergeParams: true });

router.post(
  '/team-info',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const team = await db.getTeam({
      eventId: new ObjectId(req.event._id),
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
    const key = `${req.event._id}/teams/${req.teamNumber}/${fileName}.pdf`;
    const path = await uploadFile(pdfData, key);
    const url = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/${key}`;
    console.log('Successfully uploaded object: ' + path);
    await db.updateTeam(team, { ...team, profileDocumentUrl: url });
    res.json({ ok: true });
  })
);

export default router;
