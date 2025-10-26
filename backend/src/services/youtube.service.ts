// backend/src/services/youtube.service.ts
import { google } from 'googleapis';

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

/**
 * Fetches the transcript for a YouTube video.
 * This is a placeholder for the actual implementation which might use a library like 'youtube-transcript'.
 * @param videoId The ID of the YouTube video.
 * @returns The video transcript as an array of segments.
 */
export const getVideoTranscript = async (videoId: string): Promise<TranscriptResponse[]> => {
    // In a real implementation, you would use a library like 'youtube-transcript'
    // For this example, we'll simulate a transcript.
    console.warn(`Fetching simulated transcript for video ID: ${videoId}. Replace with a real transcript service.`);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a mock transcript
    return [
        { text: '[Intro music]', duration: 5000, offset: 0 },
        { text: 'Hello everyone and welcome back to the channel.', duration: 3000, offset: 5000 },
        { text: 'Today, we have something truly special to talk about.', duration: 4000, offset: 8000 },
        { text: 'It is the future of AI and how it will change everything.', duration: 5000, offset: 12000 },
        { text: 'Now, a lot of people are scared of this, but listen closely.', duration: 4000, offset: 17000 },
        { text: 'This is the single most important moment in human history.', duration: 5000, offset: 21000 },
        { text: 'A revelation that will redefine our existence.', duration: 4000, offset: 26000 },
        { text: 'But what does that actually mean for us, for our jobs, for our families?', duration: 6000, offset: 30000 },
        { text: 'Let us dive into the specifics.', duration: 3000, offset: 36000 },
        { text: 'First, the economy. It is going to be completely transformed.', duration: 5000, offset: 39000 },
        { text: 'Think about a world where manual labor is obsolete.', duration: 4000, offset: 44000 },
        { text: 'This is not science fiction, this is happening right now.', duration: 5000, offset: 48000 },
        { text: 'And the secret trick to surviving this is adaptation.', duration: 5000, offset: 53000 },
        { text: 'A concept that most people just do not get.', duration: 4000, offset: 58000 },
        { text: 'It is the one thing nobody is talking about.', duration: 4000, offset: 62000 },
        { text: 'Okay, let me show you the impossible.', duration: 4000, offset: 66000 },
        { text: 'Watch this. I am going to do something nobody has ever done before.', duration: 6000, offset: 70000 },
        { text: 'An impossible clutch moment that defies all logic.', duration: 5000, offset: 76000 },
        { text: 'Did you see that? Let us roll it back.', duration: 3000, offset: 81000 },
        { text: 'That is the power of the new system.', duration: 4000, offset: 84000 },
        { text: 'Thanks for watching, and do not forget to subscribe!', duration: 4000, offset: 88000 },
        { text: '[Outro music]', duration: 5000, offset: 92000 },
    ];
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