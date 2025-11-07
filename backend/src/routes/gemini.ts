import express from 'express';
import { findViralMoments } from '../services/gemini.service';
import { getVideoDetails } from '../services/youtube.service';
import { extractVideoId } from '../utils/youtube.js';

const router = express.Router();

// POST /api/gemini/analyze
router.post('/analyze', async (req, res) => {
  console.log('Received /analyze request. Body:', req.body);
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  try {
    console.log(`Attempting to extract video ID from URL: "${videoUrl}"`);
    const videoId = extractVideoId(videoUrl);
    console.log(`Extracted video ID: "${videoId}"`);

    if (!videoId) {
      return res.status(400).json({
        error: 'Invalid YouTube URL',
        details: 'Could not extract a valid video ID from the provided URL. Please check the format.'
      });
    }

    // Fetch viral moments and video details in parallel
    // Note: We don't download or extract clips here - that happens when user clicks "Extract Viral Clip"
    const [viralMoments, videoDetails] = await Promise.all([
        findViralMoments(videoId),
        getVideoDetails(videoId)
    ]);

    res.json({
      videoId,
      videoDetails,
      viralMoments,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to analyze video.', details: message });
  }
});

export default router;
