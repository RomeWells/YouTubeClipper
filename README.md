# 🎬 YouTube Viral Clipper

> AI-powered tool that analyzes YouTube videos, identifies viral moments, extracts clips, and uploads them as YouTube Shorts.

## 🚀 Features

- **🤖 AI Analysis**: Uses Google Gemini to analyze videos and identify viral moments
- **📊 Viral Scoring**: Scores moments 0-100 based on emotional impact, engagement, format match, and shareability
- **✂️ Automatic Extraction**: Downloads videos with yt-dlp and extracts clips with ffmpeg
- **📤 YouTube Upload**: Direct upload to your YouTube channel via OAuth 2.0
- **⏰ Scheduling**: Schedule clips to publish at specific times
- **🎨 Modern UI**: Clean, dark-themed React interface

## 📋 Prerequisites

### Required Software
```bash
# Node.js (v18+)
node --version

# yt-dlp
yt-dlp --version

# ffmpeg
ffmpeg -version
```

### Installation Commands

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install yt-dlp ffmpeg
```

**macOS:**
```bash
brew install yt-dlp ffmpeg
```

### API Keys Needed

1. **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
2. **YouTube Data API Key** - [Google Cloud Console](https://console.cloud.google.com/)
3. **YouTube OAuth Credentials** - [Google Cloud Console](https://console.cloud.google.com/)

See [docs/USAGE.md](docs/USAGE.md) for detailed instructions on obtaining API keys.

## ⚡ Quick Start

### 1. Clone and Install

```bash
# Clone the repository (or use your existing directory)
cd /path/to/youtubeviral/Version1

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `.env.local` in the project root:

```bash
# Copy template
cp .env.template .env.local

# Edit with your API keys
nano .env.local
```

Required variables:
```env
GEMINI_API_KEY=your_gemini_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/youtube/oauth2callback
PORT=3001
NODE_ENV=development
```

### 3. Start the Application

**Option A: Using the start script**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option B: Manual start (two terminals)**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Open the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📖 Usage

### Step 1: Connect YouTube
1. Click "Connect YouTube" in the sidebar
2. Authorize the app with your Google account

### Step 2: Analyze a Video
1. Paste a YouTube URL
2. Click "Analyze Video"
3. Wait for AI to find viral moments (10-30 seconds)

### Step 3: Extract Clips
1. Review the viral moments with their scores
2. Click "Extract Viral Clip" for moments you want
3. Wait for download and extraction (10-60 seconds)

### Step 4: Upload to YouTube
1. Go to "My Clips" tab
2. Preview your extracted clips
3. Click "Post Now" or "Schedule Post"

For detailed usage instructions, see [docs/USAGE.md](docs/USAGE.md)

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  React + TypeScript + Vite
│  (Port 5173)│  • Video analysis UI
└──────┬──────┘  • Clip management
       │         • Upload controls
       │
       ↓ HTTP
┌──────────────┐
│   Backend    │  Node.js + Express + TypeScript
│  (Port 3001) │  • Gemini AI integration
└──────┬───────┘  • YouTube API
       │         • Video processing
       ↓
┌──────────────┐
│   Services   │
├──────────────┤
│ • yt-dlp     │  Video downloading
│ • ffmpeg     │  Clip extraction
│ • Gemini AI  │  Viral analysis
│ • YouTube API│  Upload & metadata
└──────────────┘
```

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── gemini.ts         # AI analysis endpoint
│   │   │   ├── auth.ts           # OAuth endpoints
│   │   │   └── youtube.ts        # Upload & extraction
│   │   ├── services/
│   │   │   ├── gemini.service.ts       # Gemini AI
│   │   │   ├── youtube.service.ts      # YouTube API
│   │   │   ├── video.service.ts        # yt-dlp & ffmpeg
│   │   │   └── youtubeUpload.service.ts # OAuth upload
│   │   └── server.ts             # Express app
│   ├── videos/
│   │   ├── downloaded/           # Full videos
│   │   └── extracted/            # Clips
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MyClips.tsx       # Clip management
│   │   │   ├── VideoPlayer.tsx   # Video preview
│   │   │   └── ScheduleModal.tsx # Scheduling UI
│   │   ├── App.tsx               # Main application
│   │   └── main.tsx              # React entry
│   └── package.json
│
├── docs/
│   ├── USAGE.md                  # Detailed usage guide
│   ├── API.md                    # API documentation
│   └── ffmpeg.md                 # FFmpeg notes
│
├── .env.local                    # Environment variables
├── .env.template                 # Template for .env
├── CLAUDE.md                     # Project instructions
├── start-dev.sh                  # Quick start script
└── README.md                     # This file
```

## 🎯 Viral Scoring Algorithm

Clips are scored 0-100 based on four criteria (25% each):

| Criteria | Weight | What It Measures |
|----------|--------|------------------|
| **Emotional Impact** | 25% | Surprise, shock, joy, inspiration |
| **Engagement Signals** | 25% | Comment density, replay likelihood |
| **Format Match** | 25% | Fits trending Short formats |
| **Shareability** | 25% | Self-contained, clear hook, broad appeal |

**Categories:**
- 🎭 Emotional Peak
- 🔄 Plot Twist
- 🔥 Hot Take
- 💎 Value Bomb
- ✨ Transformation
- 😂 Humor

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run lint         # Run ESLint
npm test             # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📚 API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

**Key Endpoints:**
- `POST /api/gemini/analyze` - Analyze video
- `POST /api/youtube/extract-clip` - Extract clip
- `POST /api/youtube/upload` - Upload to YouTube
- `POST /api/youtube/schedule` - Schedule publishing

## 🐛 Troubleshooting

### "yt-dlp not found"
```bash
# Install yt-dlp
sudo apt install yt-dlp  # Ubuntu/Debian
brew install yt-dlp      # macOS
```

### "ffmpeg not found"
```bash
# Install ffmpeg
sudo apt install ffmpeg  # Ubuntu/Debian
brew install ffmpeg      # macOS
```

### Backend won't start
```bash
# Check .env.local exists
ls -la .env.local

# Verify API keys
grep API_KEY .env.local

# Reinstall dependencies
cd backend && npm install
```

### OAuth errors
- Verify redirect URI matches Google Cloud Console exactly
- Clear browser cookies and reconnect
- Check that YouTube Data API is enabled

## 📊 Performance

- **Analysis**: 10-30 seconds per video
- **Download**: Depends on video length and internet speed
- **Extraction**: 5-15 seconds per clip
- **Upload**: 10-30 seconds per clip

**Optimization:**
- Downloaded videos are cached (reused for multiple clips)
- Extraction uses ffmpeg hardware acceleration when available
- Parallel processing for multiple clips from same video

## 🔒 Security Notes

- OAuth tokens stored in memory (not persisted)
- API keys in `.env.local` (never commit to git)
- No user data collected or stored
- Videos stored locally, not sent to third parties (except YouTube)

## 🚧 Known Limitations

1. **No Database**: Clips and analysis not persisted
2. **Memory Token Storage**: OAuth tokens reset on server restart
3. **No Rate Limiting**: Can exhaust API quotas
4. **No Cleanup**: Videos accumulate in `/backend/videos/`
5. **Single User**: No multi-user support

See [CLAUDE.md](CLAUDE.md) for detailed technical notes.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

## 📞 Support

- Check [docs/USAGE.md](docs/USAGE.md) for detailed help
- Review [CLAUDE.md](CLAUDE.md) for technical details
- Check browser console and backend logs for errors

## 🎉 Credits

Built with:
- [Google Gemini AI](https://ai.google.dev/) - Viral moment analysis
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloading
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [React](https://react.dev/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [Vite](https://vitejs.dev/) - Build tool
