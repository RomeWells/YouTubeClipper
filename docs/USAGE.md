# YouTube Viral Clipper - Usage Guide

## Complete Workflow

This guide walks you through the complete process of analyzing videos, extracting viral clips, and uploading them to YouTube.

## Prerequisites

### System Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0
- yt-dlp installed (`sudo apt install yt-dlp` or `brew install yt-dlp`)
- ffmpeg installed (`sudo apt install ffmpeg` or `brew install ffmpeg`)

### API Keys Required
Create a `.env.local` file in the project root with:

```bash
# Google Gemini API Key (for AI analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API v3 Key (for fetching video details)
YOUTUBE_API_KEY=your_youtube_api_key_here

# YouTube OAuth Credentials (for uploading videos)
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/youtube/oauth2callback

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Getting API Keys

#### 1. Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to `GEMINI_API_KEY`

#### 2. YouTube Data API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key to `YOUTUBE_API_KEY`

#### 3. YouTube OAuth Credentials
1. In the same Google Cloud project
2. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Add authorized redirect URI: `http://localhost:3001/api/youtube/oauth2callback`
5. Copy Client ID and Client Secret

## Starting the Application

### Terminal 1: Start Backend
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Dotenv loaded. YOUTUBE_API_KEY present: true
✅ All imports complete
🚀 Backend server is live and running on http://localhost:3001
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173/ in your browser.

## Step-by-Step Usage

### Step 1: Connect YouTube Account

1. Click "Connect YouTube" in the sidebar
2. You'll be redirected to Google OAuth consent screen
3. Grant permissions for:
   - Upload videos to YouTube
   - Manage your YouTube videos
4. You'll see "Authentication successful!" message
5. Return to the app

> **Important**: You must connect your YouTube account before uploading clips.

### Step 2: Analyze a Video

1. Go to the "Analyze" tab
2. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
3. Click "Analyze Video"
4. Wait for AI to analyze the video (typically 10-30 seconds)
5. You'll see the top 5 viral moments with:
   - **Viral Score** (0-100)
   - **Title** suggestion
   - **Hook** for the Short
   - **Reason** why it's viral
   - **Category** (Emotional Peak, Plot Twist, Hot Take, etc.)
   - **Timestamp** (start and end time)

### Step 3: Extract Viral Clips

1. For each viral moment you want to use, click "Extract Viral Clip"
2. The app will:
   - Download the full YouTube video using yt-dlp
   - Extract the specific clip using ffmpeg
   - Save it to `/backend/videos/extracted/`
3. Watch the loading spinner - extraction takes 10-60 seconds depending on:
   - Video length
   - Your internet speed
   - Clip duration
4. When complete, the clip is added to "My Clips"

### Step 4: Review Clips

1. Click "My Clips" in the sidebar
2. You'll see all extracted clips with:
   - Video player to preview
   - Title, hook, and reason
   - Timestamp information
3. You can remove unwanted clips by clicking the "X" button

### Step 5: Upload to YouTube

#### Option A: Post Now
1. Click "Post Now" button on any clip
2. The clip will be uploaded immediately as a public Short
3. You'll receive the YouTube video ID when complete
4. The video will appear on your channel within minutes

#### Option B: Schedule Post
1. Click "Schedule Post" button
2. Select date and time for publishing
3. The clip will be uploaded as private first
4. At the scheduled time, it will automatically be made public

## API Endpoints

### Analysis
- `POST /api/gemini/analyze` - Analyze video for viral moments

### Video Processing
- `POST /api/youtube/extract-clip` - Download and extract a clip
- `POST /api/youtube/process-and-upload` - Extract and upload in one call

### YouTube Upload
- `GET /api/youtube/auth` - Start OAuth flow
- `GET /api/youtube/oauth2callback` - OAuth callback handler
- `POST /api/youtube/upload` - Upload video to YouTube
- `POST /api/youtube/schedule` - Schedule video publishing

## File Structure

```
backend/
├── videos/
│   ├── downloaded/     # Full YouTube videos
│   └── extracted/      # Extracted clips
└── src/
    ├── routes/
    │   ├── gemini.ts   # AI analysis endpoint
    │   └── youtube.ts  # Upload & extraction endpoints
    └── services/
        ├── gemini.service.ts        # Gemini AI integration
        ├── youtube.service.ts       # YouTube Data API
        ├── video.service.ts         # yt-dlp & ffmpeg
        └── youtubeUpload.service.ts # OAuth & upload
```

## Troubleshooting

### Backend won't start
```bash
# Check if .env.local exists
ls -la .env.local

# Check if API keys are set
cat .env.local | grep API_KEY

# Install missing dependencies
cd backend && npm install
```

### yt-dlp not found
```bash
# Ubuntu/Debian
sudo apt install yt-dlp

# macOS
brew install yt-dlp

# Or use pip
pip install yt-dlp
```

### ffmpeg not found
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### OAuth errors
- Make sure `YOUTUBE_REDIRECT_URI` matches exactly in Google Cloud Console
- Check that both YouTube Data API and OAuth are enabled
- Try clearing browser cookies and reconnecting

### Extraction takes too long
- Large videos (>1 hour) take longer to download
- Consider using shorter videos for testing
- Check your internet connection speed

### Upload fails
- Verify you've connected your YouTube account
- Check OAuth token hasn't expired (reconnect if needed)
- Ensure clip file exists in `/backend/videos/extracted/`

## Viral Scoring System

Clips are scored 0-100 based on four weighted criteria (25% each):

### 1. Emotional Impact (25%)
- Surprise, shock, joy, inspiration
- Strong emotional reactions in comments
- Moments that make viewers feel something

### 2. Engagement Signals (25%)
- High comment density at timestamp
- Likely to be replayed
- Discussion-worthy moments

### 3. Format Match (25%)
- Fits trending Short formats:
  - Before/after transformations
  - Hot takes or controversial opinions
  - Unexpected humor
  - Value bombs (actionable tips)

### 4. Shareability (25%)
- Self-contained (works without context)
- Clear hook in first 2 seconds
- Broad appeal across audiences
- Satisfying payoff

## Best Practices

### Choosing Videos
- ✅ Videos with high engagement (comments, likes)
- ✅ 10-60 minute long-form content
- ✅ Educational, entertainment, or storytelling content
- ❌ Avoid very short videos (<5 min)
- ❌ Skip music videos or copyrighted content
- ❌ Don't use live streams (use archives instead)

### Optimizing Clips
- Keep clips 15-60 seconds for Shorts
- Ensure the hook is in the first 3 seconds
- Edit titles to be clickable but not misleading
- Add relevant hashtags (#shorts #viral)
- Test multiple clips from the same video

### Upload Strategy
- Upload consistently (daily or every other day)
- Use scheduling to post at peak times
- Start with "private" to review before publishing
- Monitor analytics to see what performs best

## Advanced Usage

### Batch Processing
Extract multiple clips at once by clicking "Extract" on several moments before uploading.

### Custom Timestamps
Edit the `startTime` and `endTime` in the request body to fine-tune clip boundaries.

### Re-uploading
Delete clips from "My Clips" and re-extract if you want to adjust timing.

## Performance Tips

- Downloaded videos are cached in `/backend/videos/downloaded/`
- Extracting multiple clips from the same video is faster (only downloads once)
- Clear old clips periodically to save disk space
- Use SSDs for faster video processing

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check backend terminal for server errors
3. Verify all API keys are correct
4. Ensure yt-dlp and ffmpeg are installed
5. Try with a different YouTube video

## Future Enhancements

Planned features:
- [ ] Video preview before extraction
- [ ] Custom clip editing (trim, adjust)
- [ ] Thumbnail generation
- [ ] Analytics dashboard
- [ ] Bulk upload queue
- [ ] Auto-scheduling based on best times
