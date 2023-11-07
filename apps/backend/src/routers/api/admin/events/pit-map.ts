import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../../../lib/s3-client';

const router = express.Router({ mergeParams: true });

router.post('/', fileUpload(), async (req: Request, res: Response) => {
  const pngData = (req.files.file as fileUpload.UploadedFile)?.data;
  const bucketParams = {
    ACL: 'public-read' as ObjectCannedACL,
    Bucket: process.env.DIGITALOCEAN_SPACE,
    Key: `pit-maps/${req.params.eventId}.png`,
    Body: pngData
  };

  try {
    await s3Client.send(new PutObjectCommand(bucketParams));
    console.log('Successfully uploaded object: ' + bucketParams.Bucket + '/' + bucketParams.Key);
    res.json({ ok: true });
  } catch (err) {
    console.log('Failed to upload object: ' + err);
    res.status(500).json({ error: err });
  }
});

export default router;
