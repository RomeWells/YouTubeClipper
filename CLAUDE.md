# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube Viral Clipper is an AI-powered tool that analyzes YouTube videos to identify viral moments, using Google Gemini AI to score and recommend clips for YouTube Shorts. The application is split into a Node.js backend and React frontend.

## Development Commands

### Backend (Node.js + Express + TypeScript)
```bash
cd backend
npm run dev          # Start development server with tsx watch (port 3001)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run Jest tests
```

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production (runs TypeScript check + Vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Running Both Services
The backend must be running before the frontend can function. Run in separate terminals:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Environment Configuration

The project uses `.env.local` in the root directory (loaded by backend via dotenv). Required variables:

- `GEMINI_API_KEY` - Google Gemini API key for viral moment analysis
- `YOUTUBE_API_KEY` - YouTube Data API v3 key for video details and comments
- `YOUTUBE_CLIENT_ID` - OAuth 2.0 client ID for YouTube uploads
- `YOUTUBE_CLIENT_SECRET` - OAuth 2.0 client secret
- `YOUTUBE_REDIRECT_URI` - OAuth callback URL (default: http://localhost:3001/api/auth/callback)
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

See `.env.template` for reference.

## Architecture Overview

### Backend Structure (`backend/src/`)

**Entry Point:**
- `server.ts` - Express server setup, CORS configuration, route registration

**API Routes:**
- `routes/gemini.ts` - POST `/api/gemini/analyze` endpoint for viral moment detection
- `routes/auth.ts` - OAuth flow for YouTube uploads (GET `/api/auth/url`, GET `/api/auth/callback`, POST `/api/auth/refresh`)

**Core Services:**
- `services/gemini.service.ts` - Core AI analysis logic using Google Gemini API
  - `findViralMoments(videoId)` - Analyzes transcripts and comments, returns scored viral moments
  - Uses `gemini-pro` model with detailed prompt engineering for viral scoring
- `services/youtube.service.ts` - YouTube Data API integration
  - `getVideoDetails(videoId)` - Fetches video metadata, stats, content details
  - `getVideoTranscript(videoId)` - Currently returns mock data; needs implementation with real transcript library
  - `getVideoComments(videoId)` - Fetches top 100 relevant comments

**Module System:**
- Backend uses ES modules (`"type": "module"` in package.json)
- All imports must use `.js` extensions (e.g., `import x from './routes/gemini.js'`)

### Frontend Structure (`frontend/src/`)

**Main Components:**
- `App.tsx` - Single-page application with sidebar navigation and analysis UI
- `main.tsx` - React entry point
- `index.css` - Tailwind CSS imports

**Styling:**
- Tailwind CSS configured via `tailwind.config.js` and `postcss.config.js`
- Dark theme UI (gray-900/gray-950 backgrounds)

### API Communication Flow

1. User enters YouTube URL in frontend
2. Frontend POST to `http://localhost:3001/api/gemini/analyze` with `{ videoUrl }`
3. Backend extracts video ID from URL
4. Backend calls `getVideoDetails()` and `findViralMoments()` in parallel
5. `findViralMoments()`:
   - Fetches transcript and comments via `youtube.service.ts`
   - Constructs analysis prompt with viral scoring criteria
   - Calls Gemini API with transcript (100k chars) + comments (50k chars)
   - Parses JSON response for viral moments array
6. Backend returns combined response with video details and viral moments
7. Frontend displays scored moments with titles, hooks, reasons, and categories

### Viral Scoring System

Moments are scored 0-100 based on four 25% weighted criteria:
- **Emotional Impact** - Surprise, shock, joy, inspiration
- **Engagement Signals** - Comment density, replay likelihood
- **Format Match** - Trending formats (transformations, hot takes, humor)
- **Shareability** - Self-contained value, clear hook, broad appeal

Categories: Emotional Peak, Plot Twist, Hot Take, Value Bomb, Transformation, Humor

## Recent Updates (November 2025)

### ✅ Video Extraction & Upload - NOW WORKING

The complete video extraction and upload workflow is now fully implemented and functional:

1. **Video Download**: `video.service.ts` uses `youtube-dl-exec` to download videos via yt-dlp
2. **Clip Extraction**: `ffmpeg` (via `fluent-ffmpeg`) extracts specific time segments
3. **YouTube Upload**: OAuth 2.0 authenticated upload to YouTube via googleapis
4. **Scheduling**: Videos can be scheduled for future publishing using `node-cron`

### New API Endpoints

**Video Processing:**
- `POST /api/youtube/extract-clip` - Downloads video and extracts a single clip
- `POST /api/youtube/process-and-upload` - Complete workflow: download → extract → upload

**YouTube Upload:**
- `GET /api/youtube/auth` - Initiates OAuth flow
- `GET /api/youtube/oauth2callback` - Handles OAuth callback
- `POST /api/youtube/upload` - Uploads video to YouTube
- `POST /api/youtube/schedule` - Schedules video publishing

### Frontend Updates

**App.tsx:**
- Added `extractingClip` state to track extraction progress
- `handleAddClip()` now calls `/api/youtube/extract-clip` endpoint
- Extracts video ID from URL and passes to backend
- Shows loading spinner during extraction
- Clips are added to "My Clips" with `clipPath` populated

**MyClips.tsx:**
- Already had upload functionality, now fully integrated
- Video player displays extracted clips
- "Post Now" button uploads immediately as public
- "Schedule Post" button uploads as private and schedules publishing

### File Storage

Videos are stored in `/backend/videos/`:
- `downloaded/` - Full YouTube videos (cached for reuse)
- `extracted/` - Individual clips ready for upload

Static file serving is configured in server.ts:29 - `/videos` endpoint serves extracted clips.

## Known Issues & TODOs

1. **CORS Configuration**: Verified to be correct (`http://localhost:5173` in server.ts:29)

2. **OAuth Token Storage**: Tokens are stored in memory via `setAuthenticatedOAuth2Client()`. For production:
   - Store tokens in database
   - Implement token refresh
   - Add session management

3. **No Database**: All analysis is ephemeral. Consider adding:
   - Clip history
   - Performance analytics
   - User preferences
   - Upload queue

4. **Rate Limiting**: No rate limiting implemented for:
   - Gemini API calls
   - YouTube API calls
   - Video downloads (yt-dlp)
   - Consider implementing with `express-rate-limit`

5. **Error Handling**: Could be improved:
   - Better error messages for yt-dlp failures
   - Retry logic for transient failures
   - Cleanup of partially downloaded files

6. **Disk Space Management**: No automatic cleanup of:
   - Downloaded videos in `/backend/videos/downloaded/`
   - Extracted clips in `/backend/videos/extracted/`
   - Consider implementing TTL or manual cleanup endpoint

## TypeScript Configuration Notes

- Backend: ES2020 target, ES2020 modules, strict mode enabled
- Frontend: Vite's default React-TS template configuration
- Both use `skipLibCheck: true` for faster compilation

## Testing

Test infrastructure is configured but not yet implemented:
- Backend: Jest configured via `"test": "jest"` script
- Frontend: Vite's default test setup
- No test files exist yet in either codebase

## Common Development Patterns

**Adding a New Backend Endpoint:**
1. Create/update route file in `routes/`
2. Implement service logic in `services/`
3. Register route in `server.ts`
4. Remember to use `.js` extensions in imports

**Adding a New Frontend Feature:**
1. Update `App.tsx` state and handlers
2. Add UI components in the appropriate tab section
3. Use Tailwind utility classes for styling
4. Use lucide-react for icons

**API Error Handling:**
- Backend catches errors in route handlers and returns 500 with error details
- Frontend displays errors in red alert boxes (bg-red-900)
- Console logging is used extensively for debugging

## Dependencies to Note

**Backend:**
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable loading (via -r flag in npm dev script)
- `@google/generative-ai` - Gemini AI SDK
- `googleapis` - YouTube Data API client
- `tsx` - TypeScript execution with watch mode

**Frontend:**
- `react`, `react-dom` - UI library
- `vite` - Build tool and dev server
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library

## Development Tips

- The frontend expects the backend to be on port 3001 (hardcoded in fetch calls)
- Video ID extraction regex: `/(?:v=)([^&]+)/` - only handles standard watch URLs
- Gemini responses may include markdown code fences - the backend strips these before JSON parsing
- Comments might be disabled on some videos - the service returns empty array instead of throwing
