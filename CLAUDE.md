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

## Known Issues & TODOs

1. **Mock Transcript Data**: `youtube.service.ts:getVideoTranscript()` currently returns hardcoded mock data. This needs to be replaced with a real YouTube transcript library (e.g., `youtube-transcript` npm package) or YouTube Caption API integration.

2. **CORS Port Mismatch**: The backend CORS is currently configured for `http://localhost:5175` (server.ts:11) but frontend runs on `http://localhost:5173` by default. This may cause API call failures.

3. **OAuth Token Storage**: The auth callback redirects tokens to the frontend URL (auth.ts:48), but there's no frontend implementation to handle this flow or store tokens securely.

4. **No Database**: All analysis is ephemeral. There's no persistence layer for saving clips, tracking performance, or storing user preferences.

5. **Rate Limiting**: No rate limiting implemented for Gemini or YouTube API calls. This can lead to quota exhaustion or API errors.

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
