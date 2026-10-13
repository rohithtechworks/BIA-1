import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'home-spoken-centre-videos';

let s3Client: S3Client | null = null;

if (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ACCOUNT_ID) {
  const endpoint = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  s3Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY
    }
  });
}

export const videoStorageService = {
  /**
   * Generates a short-lived signed playback URL or streaming authorization token
   */
  async generatePlaybackAuthorization(videoStorageKey: string, expiresInSeconds = 900): Promise<{ signedUrl?: string; streamToken?: string }> {
    if (s3Client) {
      try {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: videoStorageKey
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
        return { signedUrl };
      } catch (err) {
        logger.error('Failed to generate R2 presigned URL', err);
      }
    }

    // Fallback: Return stream proxy token if R2 S3 client is not configured
    return {
      streamToken: `local_auth_token_${Date.now()}`
    };
  }
};
