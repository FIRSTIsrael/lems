import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fileUpload from 'express-fileupload';
import { ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../../../lib/s3-client';
import { uploadFile } from '../../../../lib/upload';

const router = express.Router({ mergeParams: true });

router.post(
  '/team-info',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const pdfData = (req.files.file as fileUpload.UploadedFile)?.data;
    const path = await uploadFile(
      pdfData,
      `${req.params.eventId}/teams/${req.teamNumber}/team-info.pdf`
    );
    console.log('Successfully uploaded object: ' + path);
    res.json({ ok: true });
  })
);

router.get(
  '/robot-design-notebook',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const pdfData = (req.files.file as fileUpload.UploadedFile)?.data;
    const path = await uploadFile(
      pdfData,
      `${req.params.eventId}/teams/${req.teamNumber}/robot-design-notebook.pdf`
    );
    console.log('Successfully uploaded object: ' + path);
    res.json({ ok: true });
  })
);
export default router;
