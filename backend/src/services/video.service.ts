import { youtubeDl } from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths for storing videos
const videosDir = path.join(__dirname, '../../videos');
const downloadedVideosDir = path.join(videosDir, 'downloaded');
const extractedClipsDir = path.join(videosDir, 'extracted');

// Ensure directories exist
fs.mkdirSync(downloadedVideosDir, { recursive: true });
fs.mkdirSync(extractedClipsDir, { recursive: true });

/**
 * Downloads a YouTube video to a local file using yt-dlp.
 * @param videoUrl The URL of the YouTube video.
 * @param videoId The ID of the YouTube video.
 * @returns The absolute path to the downloaded video file.
 */
export const downloadVideo = async (videoUrl: string, videoId: string): Promise<string> => {
  // Normalize the video URL before processing
  const normalizedVideoUrl = normalizeYouTubeUrl(videoUrl);

  // yt-dlp handles live streams better, but we'll still provide a warning if it's a /live/ URL
  if (normalizedVideoUrl.includes('/live/')) {
    console.warn('Attempting to download a live stream. yt-dlp might handle this, but it\'s generally recommended to use completed videos.');
  }

  const outputPath = path.join(downloadedVideosDir, `${videoId}.mp4`);

  // Check if video already exists and is valid
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 1000) { // More than 1KB, likely valid
      console.log(`Video already exists at ${outputPath}, skipping download`);
      return outputPath;
    } else {
      // Delete corrupt/empty file
      fs.unlinkSync(outputPath);
      console.log(`Deleted corrupt file at ${outputPath}`);
    }
  }

  try {
    console.log(`Starting yt-dlp download for ${videoId}...`);
    await youtubeDl(normalizedVideoUrl, {
      output: outputPath,
      // Use format that's less likely to be blocked
      format: 'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      mergeOutputFormat: 'mp4',
      // Add headers to avoid 403 errors
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: 'https://www.youtube.com/',
      // Additional options to help with YouTube restrictions
      noCheckCertificates: true,
      addHeader: [
        'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language:en-us,en;q=0.5',
        'Sec-Fetch-Mode:navigate'
      ]
    });

    // Verify the download was successful
    if (!fs.existsSync(outputPath)) {
      throw new Error('Video file was not created');
    }

    const stats = fs.statSync(outputPath);
    if (stats.size < 1000) {
      fs.unlinkSync(outputPath); // Clean up empty file
      throw new Error('Downloaded video file is too small or corrupt');
    }

    console.log(`Successfully downloaded video: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return outputPath;
  } catch (error: any) {
    // Clean up any partial download
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw new Error(`Failed to download video using yt-dlp: ${error.message}`);
  }
};

/**
 * Extracts a specific segment from a video using ffmpeg.
 * @param videoPath The absolute path to the input video file.
 * @param startTime The start time of the clip in HH:MM:SS or MM:SS format.
 * @param endTime The end time of the clip in HH:MM:SS or MM:SS format.
 * @param outputFileName The desired name for the output clip file (e.g., 'clip1.mp4').
 * @returns The absolute path to the extracted clip file.
 */
export const extractClip = async (
  videoPath: string,
  startTime: string,
  endTime: string,
  outputFileName: string
): Promise<string> => {
  const outputPath = path.join(extractedClipsDir, outputFileName);

  const duration = calculateDuration(startTime, endTime);
  console.log(`Extracting clip: start=${startTime}, end=${endTime}, duration=${duration}s`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .outputOptions([
        '-c:v libx264',      // Re-encode video with H.264
        '-c:a aac',          // Re-encode audio with AAC
        '-preset fast',      // Fast encoding
        '-crf 23'            // Good quality
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('end', () => {
        console.log(`Clip extraction complete: ${outputPath}`);
        // Verify the output file size
        const stats = fs.statSync(outputPath);
        if (stats.size < 1000) {
          reject(new Error(`Extracted clip is too small (${stats.size} bytes). Extraction may have failed.`));
        } else {
          resolve(outputPath);
        }
      })
      .on('error', (error) => reject(new Error(`Failed to extract clip: ${error.message}`)))
      .run();
  });
};

/**
 * Calculates the duration between two time strings (MM:SS or HH:MM:SS).
 * @param start The start time string.
 * @param end The end time string.
 * @returns The duration in seconds.
 */
const calculateDuration = (start: string, end: string): number => {
  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) { // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) { // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    throw new Error(`Invalid time format: ${timeStr}`);
  };

  const startTimeInSeconds = parseTime(start);
  const endTimeInSeconds = parseTime(end);

  return endTimeInSeconds - startTimeInSeconds;
};

/**
 * Normalizes a YouTube URL, converting live stream paths to standard watch?v format.
 * @param url The input YouTube URL.
 * @returns The normalized YouTube URL.
 */
const normalizeYouTubeUrl = (url: string): string => {
  const liveMatch = url.match(/^https:\/\/www\.youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch) {
    return `https://www.youtube.com/watch?v=${liveMatch[1]}`;
  }
  return url;
};
