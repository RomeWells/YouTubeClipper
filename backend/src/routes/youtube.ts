import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setAuthenticatedOAuth2Client, uploadVideo, schedulePublish, isAuthenticated } from '../services/youtubeUpload.service.js';
import { downloadVideo, extractClip } from '../services/video.service.js';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root (two levels up from src/)
const envPath = join(__dirname, '../../../.env.local');
dotenv.config({ path: envPath });

const router = express.Router();

const youtubeClientId = process.env.YOUTUBE_CLIENT_ID;
const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const youtubeRedirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/youtube/oauth2callback';

if (!youtubeClientId || !youtubeClientSecret) {
  console.error('YouTube API credentials (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET) are not set.');
  // In a real application, you might want to throw an error or disable YouTube features.
}

const oauth2Client = new google.auth.OAuth2(
  youtubeClientId,
  youtubeClientSecret,
  youtubeRedirectUri
);

// Generate a URL that asks for permissions for YouTube uploads and managing videos
router.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Always ask for consent to get a refresh token
  });

  res.redirect(authorizationUrl);
});

// Handle the OAuth 2.0 callback from Google
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Store tokens securely (e.g., in a database, session, or file)
    // For this prototype, we'll just log them and keep them in memory for now.
    console.log('Access Tokens:', tokens);
    setAuthenticatedOAuth2Client(oauth2Client); // Set the authenticated client

    // Redirect back to the frontend with success message
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube Connected</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .container {
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 400px;
            }
            .checkmark {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: block;
              stroke-width: 3;
              stroke: #4ade80;
              stroke-miterlimit: 10;
              margin: 0 auto 1rem;
              box-shadow: inset 0px 0px 0px #4ade80;
              animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
            }
            .checkmark__circle {
              stroke-dasharray: 166;
              stroke-dashoffset: 166;
              stroke-width: 3;
              stroke-miterlimit: 10;
              stroke: #4ade80;
              fill: none;
              animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .checkmark__check {
              transform-origin: 50% 50%;
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke {
              100% { stroke-dashoffset: 0; }
            }
            @keyframes scale {
              0%, 100% { transform: none; }
              50% { transform: scale3d(1.1, 1.1, 1); }
            }
            @keyframes fill {
              100% { box-shadow: inset 0px 0px 0px 30px #4ade80; }
            }
            h1 { color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.75rem; }
            p { color: #6b7280; margin: 0 0 1.5rem 0; }
            .countdown { color: #8b5cf6; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <h1>✅ YouTube Connected!</h1>
            <p>Your YouTube account has been successfully authenticated.</p>
            <p class="countdown">Redirecting in <span id="countdown">3</span> seconds...</p>
          </div>
          <script>
            let count = 3;
            const countdownEl = document.getElementById('countdown');
            const interval = setInterval(() => {
              count--;
              countdownEl.textContent = count;
              if (count <= 0) {
                clearInterval(interval);
                window.location.href = 'http://localhost:5173';
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #f43f5e 0%, #dc2626 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .container {
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 400px;
            }
            h1 { color: #dc2626; margin: 0 0 1rem 0; font-size: 1.75rem; }
            p { color: #6b7280; margin: 0 0 1.5rem 0; }
            a { color: #8b5cf6; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authentication Failed</h1>
            <p>There was an error connecting your YouTube account.</p>
            <p><a href="http://localhost:5173">← Return to app</a></p>
          </div>
        </body>
      </html>
    `);
  }
});

// POST /api/youtube/upload
router.post('/upload', async (req, res) => {
  const { clipPath, title, description, tags, privacyStatus } = req.body;

  if (!clipPath || !title || !description || !privacyStatus) {
    return res.status(400).json({ error: 'Missing required fields for upload.' });
  }

  try {
    // Convert URL path to file system path
    // clipPath comes as "/videos/extracted/filename.mp4"
    // We need to convert it to absolute file system path
    let absoluteClipPath = clipPath;
    if (clipPath.startsWith('/videos/')) {
      // Remove /videos/ prefix and construct absolute path
      // __dirname is /backend/src/routes, we need to go up to /backend/videos
      const relativePath = clipPath.replace('/videos/', '');
      absoluteClipPath = join(__dirname, '../../videos', relativePath);
      console.log(`Converted URL path ${clipPath} to file system path ${absoluteClipPath}`);
    }

    console.log(`📤 Uploading video from: ${absoluteClipPath}`);
    const videoId = await uploadVideo(absoluteClipPath, { title, description, tags, privacyStatus });
    console.log(`✅ Video uploaded successfully! YouTube ID: ${videoId}`);
    res.status(200).json({ videoId });
  } catch (error) {
    console.error('Error uploading video:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to upload video.', details: message });
  }
});

// GET /api/youtube/auth-status
router.get('/auth-status', (req, res) => {
  const authenticated = isAuthenticated();
  res.json({
    authenticated,
    message: authenticated ? 'YouTube API is authenticated' : 'Not authenticated. Please connect YouTube account.'
  });
});

// POST /api/youtube/schedule
router.post('/schedule', async (req, res) => {
  const { videoId, publishAt } = req.body;

  if (!videoId || !publishAt) {
    return res.status(400).json({ error: 'Missing required fields for scheduling.' });
  }

  try {
    schedulePublish(videoId, new Date(publishAt));
    res.status(200).json({ message: 'Video scheduled successfully.' });
  } catch (error) {
    console.error('Error scheduling video:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to schedule video.', details: message });
  }
});

// POST /api/youtube/extract-clip
// Extracts a single clip from a YouTube video
router.post('/extract-clip', async (req, res) => {
  const { videoUrl, videoId, startTime, endTime, clipName } = req.body;

  if (!videoUrl || !videoId || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields: videoUrl, videoId, startTime, endTime' });
  }

  try {
    console.log(`📥 Downloading video ${videoId}...`);
    const videoPath = await downloadVideo(videoUrl, videoId);
    console.log(`✅ Video downloaded to: ${videoPath}`);

    const clipFileName = clipName || `${videoId}_${startTime.replace(/:/g, '-')}_to_${endTime.replace(/:/g, '-')}.mp4`;
    console.log(`✂️ Extracting clip from ${startTime} to ${endTime}...`);
    const clipPath = await extractClip(videoPath, startTime, endTime, clipFileName);
    console.log(`✅ Clip extracted to: ${clipPath}`);

    res.status(200).json({
      success: true,
      clipPath,
      clipUrl: `/videos/extracted/${clipFileName}`,
      message: 'Clip extracted successfully'
    });
  } catch (error) {
    console.error('Error extracting clip:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to extract clip.', details: message });
  }
});

// POST /api/youtube/process-and-upload
// Complete workflow: extract clip and upload to YouTube
router.post('/process-and-upload', async (req, res) => {
  const { videoUrl, videoId, startTime, endTime, title, description, tags, privacyStatus } = req.body;

  if (!videoUrl || !videoId || !startTime || !endTime || !title || !description) {
    return res.status(400).json({
      error: 'Missing required fields: videoUrl, videoId, startTime, endTime, title, description'
    });
  }

  try {
    // Step 1: Download video
    console.log(`📥 Downloading video ${videoId}...`);
    const videoPath = await downloadVideo(videoUrl, videoId);
    console.log(`✅ Video downloaded to: ${videoPath}`);

    // Step 2: Extract clip
    const clipFileName = `${videoId}_${Date.now()}.mp4`;
    console.log(`✂️ Extracting clip from ${startTime} to ${endTime}...`);
    const clipPath = await extractClip(videoPath, startTime, endTime, clipFileName);
    console.log(`✅ Clip extracted to: ${clipPath}`);

    // Step 3: Upload to YouTube
    console.log(`📤 Uploading clip to YouTube...`);
    const uploadedVideoId = await uploadVideo(clipPath, {
      title,
      description,
      tags: tags || [],
      privacyStatus: privacyStatus || 'private'
    });
    console.log(`✅ Video uploaded! YouTube Video ID: ${uploadedVideoId}`);

    res.status(200).json({
      success: true,
      clipPath,
      youtubeVideoId: uploadedVideoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${uploadedVideoId}`,
      message: 'Clip processed and uploaded successfully'
    });
  } catch (error) {
    console.error('Error processing and uploading clip:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to process and upload clip.', details: message });
  }
});

export default router;
