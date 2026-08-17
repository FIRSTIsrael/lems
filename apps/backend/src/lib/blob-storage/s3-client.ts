import { S3 } from '@aws-sdk/client-s3';

const accessKeyId = process.env.DIGITALOCEAN_KEY;
const secretAccessKey = process.env.DIGITALOCEAN_SECRET;

if (!accessKeyId || !secretAccessKey) {
  throw new Error('DIGITALOCEAN_KEY and DIGITALOCEAN_SECRET environment variables are required');
}

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: `https://${process.env.DIGITALOCEAN_ENDPOINT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

export { s3Client };
