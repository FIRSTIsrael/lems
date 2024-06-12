import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fileUpload from 'express-fileupload';
import { uploadFile } from '../../../../lib/upload';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const pngData = (req.files.file as fileUpload.UploadedFile)?.data;
    const path = await uploadFile(pngData, `pit-maps/${req.params.divisionId}.png`);
    console.log('Successfully uploaded object: ' + path);
    res.json({ ok: true });
  })
);

export default router;
