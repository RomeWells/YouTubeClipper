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
