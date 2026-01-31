import { ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3-client';

export const uploadFile = async (data: Buffer, key: string) => {
  const bucket = process.env.DIGITALOCEAN_SPACE;
  const endpoint = process.env.DIGITALOCEAN_ENDPOINT;
  const bucketParams = {
    ACL: 'public-read' as ObjectCannedACL,
    Bucket: bucket,
    Key: key,
    Body: data
  };

  await s3Client.send(new PutObjectCommand(bucketParams));
  return `https://${bucket}.${endpoint}/${key}`;
};
