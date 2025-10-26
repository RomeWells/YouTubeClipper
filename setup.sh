#!/bin/bash

# YouTube Viral Clipper - Automated Setup Script
# This script sets up the complete project structure

set -e  # Exit on error

echo "🔥 YouTube Viral Clipper - Setup Script"
echo "========================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Create project structure
echo "📁 Creating project structure..."
mkdir -p backend/src/{routes,services}
mkdir -p frontend/src/{components,services}
mkdir -p docs

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env.local
.env.*.local
.env

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/
EOL

# Create environment template
echo "�� Creating .env.template..."
cat > .env.template << 'EOL'
# Google Gemini API
# Get your key at: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API v3
# Get credentials at: https://console.cloud.google.com/apis/credentials
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Server Configuration
PORT=3001
NODE_ENV=development
EOL

# Copy template to .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.template .env.local
    echo "✅ Created .env.local (please add your API keys)"
else
    echo "⚠️  .env.local already exists, skipping"
fi

# Setup Backend
echo ""
echo "🔧 Setting up backend..."
cd backend

if [ ! -f package.json ]; then
    npm init -y
    
    # Update package.json with project info
    node -e "
    const pkg = require('./package.json');
    pkg.type = 'module';
    pkg.scripts = {
        'dev': 'tsx watch src/server.ts',
        'build': 'tsc',
        'start': 'node dist/server.js',
        'test': 'jest'
    };
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
fi

echo "📦 Installing backend dependencies..."
npm install express cors dotenv @google/generative-ai googleapis

echo "📦 Installing backend dev dependencies..."
npm install -D @types/express @types/cors @types/node typescript tsx

# Create tsconfig.json
if [ ! -f tsconfig.json ]; then
    echo "📝 Creating backend tsconfig.json..."
    cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOL
fi

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up frontend..."

if [ ! -d frontend ]; then
    echo "Creating React + TypeScript project with Vite..."
    npm create vite@latest frontend -- --template react-ts
fi

cd frontend

echo "📦 Installing frontend dependencies..."
npm install lucide-react

echo "📦 Installing frontend dev dependencies..."
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind if not exists
if [ ! -f tailwind.config.js ]; then
    echo "🎨 Initializing Tailwind CSS..."
    npx tailwindcss init -p
    
    # Update tailwind.config.js
    cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL
fi

# Create/update index.css
cat > src/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

cd ..

# Create README files
echo ""
echo "📚 Creating documentation..."

if [ ! -f docs/API.md ]; then
    cat > docs/API.md << 'EOL'
# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### POST /gemini/analyze
Analyzes a YouTube video for viral moments.

**Request:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "videoId": "VIDEO_ID",
  "viralMoments": [...],
  "overallStats": {...}
}
```

### POST /gemini/generate-metadata
Generates optimized metadata for a clip.

**Request:**
```json
{
  "startSeconds": 154,
  "endSeconds": 189,
  "transcriptSegment": "...",
  "comments": [...]
}
```

**Response:**
```json
{
  "title": "...",
  "description": "...",
  "hashtags": [...],
  "hook": "..."
}
```
EOL
fi

# Create startup script
echo ""
echo "🚀 Creating startup scripts..."

cat > start-dev.sh << 'EOL'
#!/bin/bash
# Start both backend and frontend in development mode

echo "🔥 Starting YouTube Viral Clipper..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it and add your API keys."
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📍 Backend:  http://localhost:3001"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOL

chmod +x start-dev.sh

# Final instructions
echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add your API keys to .env.local:"
echo "   - Get Gemini API key: https://makersuite.google.com/app/apikey"
echo "   - Get YouTube API key: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Copy the provided source files:"
echo "   - backend/src/server.ts"
echo "   - backend/src/routes/gemini.ts"
echo "   - backend/src/services/gemini.service.ts"
echo "   - backend/src/services/youtube.service.ts"
echo "   - frontend/src/App.tsx"
echo ""
echo "3. Start the development servers:"
echo "   ./start-dev.sh"
echo ""
echo "   OR manually:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - GEMINI-CLI-GUIDE.md - Using Gemini CLI"
echo "   - docs/API.md - API reference"
echo ""
echo "🎉 Happy viral clip hunting!"
