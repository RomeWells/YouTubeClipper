// backend/src/services/youtube.service.ts
import { google } from 'googleapis';
import { fetchTranscript } from 'youtube-transcript-plus';

// Define the transcript response type locally
interface TranscriptResponse {
  text: string;
  duration: number;
  offset: number;
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('❌ YOUTUBE_API_KEY is missing!');
  console.error(' Please add it to .env.local in the project root');
  console.error(' Get your key at: https://console.cloud.google.com/apis/credentials');
  throw new Error('YOUTUBE_API_KEY is not set in the environment variables.');
}

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});

/**
 * Fetches video details from the YouTube Data API.
 * @param videoId The ID of the YouTube video.
 * @returns Video details or null if not found.
 */
export const getVideoDetails = async (videoId: string) => {
  try {
    const response = await youtube.videos.list({
      key: YOUTUBE_API_KEY,
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId],
    });
    return response.data.items?.[0] || null;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw new Error('Failed to fetch video details from YouTube API.');
  }
};

import { fetchTranscript } from 'youtube-transcript-plus';

/**
 * Fetches the transcript for a YouTube video using the youtube-transcript-plus library.
 * @param videoId The ID of the YouTube video.
 * @returns The video transcript as an array of segments.
 */
export const getVideoTranscript = async (videoId: string): Promise<TranscriptResponse[]> => {
  try {
    console.log(`Fetching real transcript for video ID: ${videoId} using youtube-transcript-plus...`);
    // Using the more robust 'youtube-transcript-plus' library.
    const transcript = await fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      console.warn(`No transcript available for video ID: ${videoId}`);
      return [];
    }
    
    return transcript.map(item => ({
      text: item.text,
      duration: item.duration,
      offset: item.offset,
    }));
  } catch (error) {
    console.error(`Could not fetch transcript for video ID ${videoId}:`, error);
    return [];
  }
};

/**
 * Fetches comments for a YouTube video.
 * @param videoId The ID of the YouTube video.
 * @returns A list of comment threads.
 */
export const getVideoComments = async (videoId: string) => {
  try {
    const response = await youtube.commentThreads.list({
      key: YOUTUBE_API_KEY,
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100, // Fetch top 100 comments
      order: 'relevance',
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching video comments:', error);
    // Don't throw, as comments might be disabled. Return empty array.
    return [];
  }
};