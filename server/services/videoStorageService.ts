import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'brilliantiasacademy';
const R2_CUSTOM_DOMAIN = process.env.R2_CUSTOM_DOMAIN;

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
   * Generates a short-lived signed playback URL or custom Cloudflare R2 URL
   */
  async generatePlaybackAuthorization(videoStorageKey: string, expiresInSeconds = 900): Promise<{ signedUrl?: string; streamToken?: string }> {
    if (R2_CUSTOM_DOMAIN && R2_CUSTOM_DOMAIN.trim() !== '') {
      const baseUrl = R2_CUSTOM_DOMAIN.replace(/\/+$/, '');
      const cleanKey = videoStorageKey.replace(/^\/+/, '');
      return { signedUrl: `${baseUrl}/${cleanKey}` };
    }

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

    return {
      streamToken: `local_auth_token_${Date.now()}`
    };
  },

  /**
   * Streams video file from Cloudflare R2 bucket supporting HTTP Range requests
   */
  async getVideoStream(videoStorageKey: string, rangeHeader?: string) {
    if (!s3Client) {
      throw new Error('Cloudflare R2 S3 client is not configured');
    }

    const cleanKey = videoStorageKey.replace(/^\/+/, '');
    const keysToTry = [
      cleanKey,
      cleanKey.replace(/^videos\//, ''),
      `videos/${cleanKey}`,
      cleanKey.endsWith('.mp4') ? cleanKey.replace(/\.mp4$/, '') : `${cleanKey}.mp4`
    ];

    let lastError: unknown = null;

    for (const key of keysToTry) {
      try {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Range: rangeHeader
        });

        const response = await s3Client.send(command);
        return {
          stream: response.Body,
          contentLength: response.ContentLength,
          contentRange: response.ContentRange,
          contentType: response.ContentType || 'video/mp4'
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error(`Video file ${videoStorageKey} not found in R2 bucket`);
  }
};
