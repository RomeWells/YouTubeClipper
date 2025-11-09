import express from 'express';
import { findViralMoments, findViralMomentsFromTranscript } from '../services/gemini.service.js'; // Import findViralMomentsFromTranscript
import { getVideoDetails, getVideoTranscript } from '../services/youtube.service.js'; // Import getVideoTranscript
import { extractVideoId } from '../utils/youtube.js';
import { WhisperService } from '../services/whisper.service.js';

const router = express.Router();
const whisperService = new WhisperService();

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

// POST /api/gemini/whisper-transcribe - New endpoint for Whisper transcription
router.post('/whisper-transcribe', async (req, res) => {
  console.log('Received /whisper-transcribe request. Body:', req.body);
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  try {
    console.log(`Attempting Whisper transcription for URL: "${videoUrl}"`);
    const transcript = await whisperService.transcribe(videoUrl);

    console.log('Whisper transcription successful. Finding viral moments from transcript...');
    // Import findViralMomentsFromTranscript
    const { findViralMomentsFromTranscript } = await import('../services/gemini.service.js');
    const viralMoments = await findViralMomentsFromTranscript(transcript);

    res.json({ transcript, source: 'whisper', viralMoments });
  } catch (error) {
    console.error('Whisper transcription error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to transcribe video using Whisper.', details: message });
  }
});

// POST /api/gemini/transcribe-and-analyze - New endpoint with fallback logic
router.post('/transcribe-and-analyze', async (req, res) => {
  console.log('Received /transcribe-and-analyze request. Body:', req.body);
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  let transcript: string | undefined;
  let source: 'youtube' | 'whisper' | undefined;
  let viralMoments;

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        error: 'Invalid YouTube URL',
        details: 'Could not extract a valid video ID from the provided URL. Please check the format.'
      });
    }

    // 1. Attempt YouTube transcription
    try {
      console.log(`Attempting YouTube transcription for video ID: "${videoId}"`);
      const transcriptData = await getVideoTranscript(videoId);
      if (transcriptData && transcriptData.length > 0) {
        transcript = transcriptData.map(t => t.text).join(' ');
        source = 'youtube';
        console.log('YouTube transcription successful. Finding viral moments...');
        viralMoments = await findViralMoments(videoId); // Use findViralMoments which includes comments
      }
    } catch (youtubeError: any) {
      console.warn(`YouTube transcription failed for ${videoId}: ${youtubeError.message}. Falling back to Whisper.`);
      // Continue to Whisper if YouTube fails
    }

    // 2. If YouTube failed, attempt Whisper transcription
    if (!transcript) {
      console.log(`Attempting Whisper transcription for URL: "${videoUrl}"`);
      transcript = await whisperService.transcribe(videoUrl);
      source = 'whisper';
      console.log('Whisper transcription successful. Finding viral moments from transcript...');
      viralMoments = await findViralMomentsFromTranscript(transcript);
    }

    if (!transcript) {
      return res.status(500).json({ error: 'Failed to obtain transcript from both YouTube and Whisper.' });
    }

    res.json({ transcript, source, viralMoments });

  } catch (error) {
    console.error('Transcribe and Analyze error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: 'Failed to transcribe and analyze video.', details: message });
  }
});

export default router;
