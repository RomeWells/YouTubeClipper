import { GoogleGenerativeAI } from '@google/generative-ai';
import { getVideoTranscript, getVideoComments } from './youtube.service';

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
  1.  "timestamp": The start time of the moment in "M:SS" format.
  2.  "viralScore": A score from 0-100 indicating its viral potential.
  3.  "hook": The single, most impactful sentence or phrase from that moment.
  4.  "reason": A brief, compelling explanation of WHY this moment is likely to go viral (e.g., "addresses a controversial topic," "shows a surprising transformation," "has a strong emotional peak").
  5.  "category": One of the following: "Emotional Peak", "Plot Twist", "Hot Take", "Value Bomb", "Transformation", "Humor".
  6.  "suggestedTitle": A catchy, SEO-friendly YouTube Shorts title (max 60 chars) with relevant emojis.
  7.  "suggestedDescription": A brief, engaging description with 2-3 relevant hashtags.

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
export const findViralMoments = async (videoId: string) => {
  try {
    const [transcriptData, commentsData] = await Promise.all([
      getVideoTranscript(videoId),
      getVideoComments(videoId),
    ]);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('Transcript is not available for this video.');
    }

    const transcript = transcriptData.map(t => t.text).join(' ');
    const comments = commentsData.map(c => c.snippet?.topLevelComment?.snippet?.textDisplay || '').join('\n');

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
