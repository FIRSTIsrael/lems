import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
  ListObjectsV2CommandInput,
  HeadObjectCommandInput,
  CopyObjectCommandInput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Helper function to convert a stream to buffer
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export interface ObjectStorageConfig {
  endpoint: string;
  space: string;
  accessKey: string;
  secretKey: string;
}

/**
 * Interface for storing data in DigitalOcean Spaces.
 */
export class ObjectStorage {
  private readonly s3Client: S3Client;

  constructor(private readonly config: ObjectStorageConfig) {
    this.s3Client = new S3Client({
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: this.config.endpoint,
      region: 'us-east-1', // Required by AWS SDK, but doesn't affect performance
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey
      }
    });
  }

  /**
   * Upload a file to the space
   * @returns The public URL of the uploaded file
   */
  async putObject(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string
  ): Promise<string> {
    const params: PutObjectCommandInput = {
      Bucket: this.config.space,
      Key: key,
      Body: body,
      ...(contentType && { ContentType: contentType }),
      ACL: 'public-read' // Make objects publicly readable by default
    };

    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  /**
   * Get a file from the space
   */
  async getObject(key: string): Promise<Buffer> {
    const params: GetObjectCommandInput = {
      Bucket: this.config.space,
      Key: key
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3Client.send(command);

    if (!response.Body) {
      throw new Error('Object body is empty');
    }

    // Handle different types of response body
    if (response.Body instanceof Buffer) {
      return response.Body;
    }

    if (typeof response.Body === 'string') {
      return Buffer.from(response.Body);
    }

    // Handle readable stream
    return streamToBuffer(response.Body as NodeJS.ReadableStream);
  }

  /**
   * Delete a file from the space
   */
  async deleteObject(key: string): Promise<void> {
    const params: DeleteObjectCommandInput = {
      Bucket: this.config.space,
      Key: key
    };

    const command = new DeleteObjectCommand(params);
    await this.s3Client.send(command);
  }

  /**
   * List objects in the space
   */
  async listObjects(prefix?: string, maxKeys?: number): Promise<string[]> {
    const params: ListObjectsV2CommandInput = {
      Bucket: this.config.space,
      ...(prefix && { Prefix: prefix }),
      ...(maxKeys && { MaxKeys: maxKeys })
    };

    const command = new ListObjectsV2Command(params);
    const response = await this.s3Client.send(command);

    return response.Contents?.map(obj => obj.Key || '') || [];
  }

  /**
   * Check if an object exists
   */
  async objectExists(key: string): Promise<boolean> {
    try {
      const params: HeadObjectCommandInput = {
        Bucket: this.config.space,
        Key: key
      };

      const command = new HeadObjectCommand(params);
      await this.s3Client.send(command);
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NotFound') {
        return false;
      }
      if (
        error &&
        typeof error === 'object' &&
        '$metadata' in error &&
        typeof error.$metadata === 'object' &&
        error.$metadata &&
        'httpStatusCode' in error.$metadata &&
        error.$metadata.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Copy an object within the space
   */
  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    const params: CopyObjectCommandInput = {
      Bucket: this.config.space,
      CopySource: `${this.config.space}/${sourceKey}`,
      Key: destinationKey,
      ACL: 'public-read'
    };

    const command = new CopyObjectCommand(params);
    await this.s3Client.send(command);
  }

  /**
   * Generate a presigned URL for temporary access to an object
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const params: GetObjectCommandInput = {
      Bucket: this.config.space,
      Key: key
    };

    const command = new GetObjectCommand(params);
    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Generate a presigned URL for uploading an object
   */
  async getPresignedUploadUrl(
    key: string,
    contentType?: string,
    expiresIn = 3600
  ): Promise<string> {
    const params: PutObjectCommandInput = {
      Bucket: this.config.space,
      Key: key,
      ...(contentType && { ContentType: contentType }),
      ACL: 'public-read'
    };

    const command = new PutObjectCommand(params);
    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Get the public URL for an object
   */
  getPublicUrl(key: string): string {
    return `https://${this.config.space}.${this.config.endpoint}/${key}`;
  }

  /**
   * Get the CDN URL for an object (if CDN is enabled)
   */
  getCdnUrl(key: string, cdnEndpoint?: string): string {
    if (cdnEndpoint) {
      return `https://${cdnEndpoint}/${key}`;
    }
    return this.getPublicUrl(key);
  }
}
