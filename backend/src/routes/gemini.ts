import express from 'express';
import { findViralMoments } from '../services/gemini.service';
import { getVideoDetails } from '../services/youtube.service';

const router = express.Router();

// POST /api/gemini/analyze
router.post('/analyze', async (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  try {
    // Extract video ID from URL
    const videoIdMatch = videoUrl.match(/(?:v=)([^&]+)/);
    if (!videoIdMatch || !videoIdMatch[1]) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    const videoId = videoIdMatch[1];

    // Fetch viral moments and video details in parallel
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
