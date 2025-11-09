import { GoogleGenerativeAI } from '@google/generative-ai';
import { getVideoTranscript, getVideoComments } from './youtube.service.js';
import { youtube_v3 } from '@googleapis/youtube';
import { exec } from 'child_process'; // Import exec
import { promisify } from 'util'; // Import promisify
import * as path from 'path'; // Import path

const execAsync = promisify(exec); // Promisify exec

interface TranscriptItem {
  text: string;
}

interface Clip {
  timestamp?: string; // Made optional as gemini_clip_finder.py doesn't return it
  startTime: string;
  endTime: string;
  viralScore: number;
  hook: string;
  reason: string;
  category: string;
  suggestedTitle: string;
  suggestedDescription: string;
  clipPath?: string; // Added for consistency with MyClips.tsx
  tags?: string[]; // Added for consistency with MyClips.tsx
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const ANALYSIS_PROMPT = `
  You are an expert YouTube content strategist specializing in identifying viral moments for YouTube Shorts.
  Your task is to analyze a YouTube video's transcript and comments to find the 5 most promising clips that could go viral.

  Analyze the following video content:
  Transcript:
  ---
  {transcript}
  ---
  Comments:
  ---
  {comments}
  ---

  Based on the content, identify the top 5 most viral-worthy moments. For each moment, provide:
  1.  "timestamp": The start time of the moment in "M:SS" format. (This will be used for display, but use startTime and endTime for extraction)
  2.  "startTime": The exact start time of the clip in "MM:SS" or "HH:MM:SS" format.
  3.  "endTime": The exact end time of the clip in "MM:SS" or "HH:MM:SS" format.
  4.  "viralScore": A score from 0-100 indicating its viral potential.
  5.  "hook": The single, most impactful sentence or phrase from that moment.
  6.  "reason": A brief, compelling explanation of WHY this moment is likely to go viral (e.g., "addresses a controversial topic," "shows a surprising transformation," "has a strong emotional peak").
  7.  "category": One of the following: "Emotional Peak", "Plot Twist", "Hot Take", "Value Bomb", "Transformation", "Humor".
  8.  "suggestedTitle": A catchy, SEO-friendly YouTube Shorts title (max 60 chars) with relevant emojis.
  9.  "suggestedDescription": A brief, engaging description with 2-3 relevant hashtags.

  Scoring Criteria (Weight):
  - Emotional Impact (25%): Does it evoke strong emotions like surprise, shock, joy, or inspiration?
  - Engagement Signals (25%): Is it a topic dense with comments? Is it a part people are likely to re-watch?
  - Format Match (25%): Does it fit a trending format (e.g., transformations, hot takes, satisfying loops)?
  - Shareability (25%): Is the clip self-contained, with a clear hook and broad appeal?

  Return the response as a valid JSON object containing a single key "viralMoments" which is an array of the 5 moments.
  Do not include any other text or formatting outside of the JSON object.
`;

/**
 * Analyzes a video to find viral moments using the Gemini AI.
 * @param videoId The ID of the YouTube video.
 * @returns A list of potential viral moments.
 */
export const findViralMoments = async (videoId: string): Promise<Clip[]> => {
  try {
    const [transcriptData, commentsData] = await Promise.all([
      getVideoTranscript(videoId),
      getVideoComments(videoId),
    ]);

    if (!transcriptData || transcriptData.length === 0) {
      const noTranscriptError = new Error('Transcript is not available for this video. This often happens with live streams or very new videos.');
      noTranscriptError.name = 'NoTranscriptError';
      throw noTranscriptError;
    }

    const transcript = transcriptData.map((t: TranscriptItem) => t.text).join(' ');
    const comments = commentsData.map((c: youtube_v3.Schema$CommentThread) => c.snippet?.topLevelComment?.snippet?.textDisplay || '').join('\n');

    const prompt = ANALYSIS_PROMPT
      .replace('{transcript}', transcript.slice(0, 100000)) // Use a reasonable portion of the transcript
      .replace('{comments}', comments.slice(0, 50000)); // Use a reasonable portion of comments

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const jsonResponse = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());

    return jsonResponse.viralMoments;

  } catch (error) {
    console.error('Error finding viral moments:', error);
    throw new Error('Failed to analyze video with Gemini AI.');
  }
};

/**
 * Finds viral moments from a given transcript using the Python script.
 * @param transcript The transcript of the video.
 * @returns A list of potential viral moments.
 */
export const findViralMomentsFromTranscript = async (transcript: string): Promise<Clip[]> => {
  try {
    // Escape double quotes in the transcript for shell command
    const escapedTranscript = transcript.replace(/"/g, '\\"');

    const command = `../venv/bin/python3 ../gemini_clip_finder.py --transcript "${escapedTranscript}"`;
    console.log('Executing command:', command);

    const { stdout, stderr } = await execAsync(command, {
      cwd: path.join(process.cwd(), '../'), // Set CWD to project root
      env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY } // Pass GEMINI_API_KEY
    });

    if (stderr) {
      console.error('gemini_clip_finder.py stderr:', stderr);
    }

    // Clean the response to ensure it's valid JSON
    const jsonResponse = JSON.parse(stdout.replace(/```json/g, '').replace(/```/g, '',).trim());

    return jsonResponse.viralMoments;
  } catch (error) {
    console.error('Error finding viral moments from transcript:', error);
    throw new Error('Failed to find viral moments from transcript using Gemini.');
  }
};
