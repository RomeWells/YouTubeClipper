import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root (two levels up from src/)
const envPath = join(__dirname, '../../.env.local');
console.log('📁 Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('✅ Dotenv loaded. YOUTUBE_API_KEY present:', !!process.env.YOUTUBE_API_KEY);

// NOW import the routes AFTER dotenv is configured
const { default: geminiRoutes } = await import('./routes/gemini.js');
const { default: authRoutes } = await import('./routes/auth.js');
console.log('✅ All imports complete');

console.log('📦 Initializing Express app...');
const app = express();

console.log('🔧 Configuring middleware...');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
console.log('✅ Middleware configured.');

const PORT = process.env.PORT || 3001;

console.log('🛣️ Registering routes...');
app.use('/api/gemini', geminiRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('YouTube Viral Clipper API is running!');
});
console.log('✅ Routes registered.');

console.log(`👂 Attempting to start server on port ${PORT}...`);
app.listen(PORT, () => console.log(`🚀 Backend server is live and running on http://localhost:${PORT}`));