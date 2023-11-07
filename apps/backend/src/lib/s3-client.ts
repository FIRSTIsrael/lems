import { S3 } from '@aws-sdk/client-s3';

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: `https://${process.env.DIGITALOCEAN_ENDPOINT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.DIGITALOCEAN_KEY,
    secretAccessKey: process.env.DIGITALOCEAN_SECRET
  }
});

export { s3Client };
