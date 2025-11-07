import { google } from 'googleapis';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import cron from 'node-cron';

// This will be populated with the authenticated OAuth2Client after successful authentication
let authenticatedOAuth2Client: OAuth2Client | null = null;

export const setAuthenticatedOAuth2Client = (client: OAuth2Client) => {
  authenticatedOAuth2Client = client;
  console.log('✅ YouTube OAuth2 client authenticated successfully!');
};

export const isAuthenticated = (): boolean => {
  return authenticatedOAuth2Client !== null;
};

/**
 * Uploads a video to YouTube.
 * @param clipPath The absolute path to the video clip file.
 * @param metadata The video metadata (title, description, tags, privacyStatus).
 * @returns The ID of the uploaded YouTube video.
 */
export const uploadVideo = async (clipPath: string, metadata: any): Promise<string> => {
  if (!authenticatedOAuth2Client) {
    throw new Error('YouTube API client not authenticated. Please authenticate first.');
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: authenticatedOAuth2Client,
  });

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: '22', // Default to 'People & Blogs' or a more relevant category
      },
      status: {
        privacyStatus: metadata.privacyStatus, // 'public', 'private', 'unlisted'
        // publishAt: metadata.publishAt, // Use this for scheduled publishing if direct API support is added
      },
    },
    media: {
      body: fs.createReadStream(clipPath),
    },
  });

  if (!res.data.id) {
    throw new Error('Failed to get video ID after upload.');
  }

  return res.data.id;
};

/**
 * Updates the privacy status of a YouTube video.
 * @param videoId The ID of the YouTube video.
 * @param privacyStatus The new privacy status ('public', 'private', 'unlisted').
 */
export const updateVideoPrivacyStatus = async (videoId: string, privacyStatus: 'public' | 'private' | 'unlisted') => {
  if (!authenticatedOAuth2Client) {
    throw new Error('YouTube API client not authenticated. Please authenticate first.');
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: authenticatedOAuth2Client,
  });

  await youtube.videos.update({
    part: ['status'],
    requestBody: {
      id: videoId,
      status: {
        privacyStatus: privacyStatus,
      },
    },
  });
};

/**
 * Schedules a video to be published at a specific time.
 * @param videoId The ID of the YouTube video to schedule.
 * @param publishAt The Date object representing the desired publish time.
 */
export const schedulePublish = (videoId: string, publishAt: Date) => {
  if (!authenticatedOAuth2Client) {
    throw new Error('YouTube API client not authenticated. Please authenticate first.');
  }

  const now = new Date();
  if (publishAt <= now) {
    console.warn(`Publish time ${publishAt.toISOString()} is in the past or present. Publishing immediately.`);
    updateVideoPrivacyStatus(videoId, 'public');
    return;
  }

  const cronTime = `${publishAt.getSeconds()} ${publishAt.getMinutes()} ${publishAt.getHours()} ${publishAt.getDate()} ${publishAt.getMonth() + 1} *`;
  console.log(`Scheduling video ${videoId} to be published at ${publishAt.toISOString()} with cron pattern: ${cronTime}`);

  cron.schedule(cronTime, async () => {
    console.log(`Attempting to publish video ${videoId} now.`);
    try {
      await updateVideoPrivacyStatus(videoId, 'public');
      console.log(`Video ${videoId} successfully published.`);
    } catch (error) {
      console.error(`Failed to publish video ${videoId}:`, error);
    }
  }, {
    scheduled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
  });
};

