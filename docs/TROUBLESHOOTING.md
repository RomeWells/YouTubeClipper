# Troubleshooting YouTube Viral Clipper

## Critical Issue: yt-dlp 403 Forbidden Error

### Problem
YouTube is blocking video downloads with `HTTP Error 403: Forbidden` because:
- Your yt-dlp version (2024.04.09) is outdated
- YouTube has updated their anti-bot protections
- Newer yt-dlp versions have workarounds for this

### Solution 1: Update yt-dlp (Recommended)

**Option A: Using pipx (Recommended)**
```bash
# Install pipx if you don't have it
sudo apt install pipx
# OR on macOS:
brew install pipx

# Install latest yt-dlp via pipx
pipx install yt-dlp --force

# Verify version (should be 2024.11.x or newer)
yt-dlp --version
```

**Option B: Using pip with user install**
```bash
pip3 install --user --upgrade yt-dlp

# Add to PATH if needed
export PATH="$HOME/.local/bin:$PATH"

# Verify
yt-dlp --version
```

**Option C: Download binary directly**
```bash
# Download latest release
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Verify
yt-dlp --version
```

### Solution 2: Use Browser Cookies (Alternative)

If you can't update yt-dlp, you can use cookies from your browser:

1. **Install browser extension:**
   - Chrome/Edge: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - Firefox: [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)

2. **Export cookies:**
   - Go to youtube.com and make sure you're logged in
   - Click the extension icon
   - Export cookies to `~/youtube_cookies.txt`

3. **Update video.service.ts to use cookies:**
   ```typescript
   await youtubeDl(normalizedVideoUrl, {
     output: outputPath,
     format: 'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best',
     mergeOutputFormat: 'mp4',
     cookies: '/home/romantest/youtube_cookies.txt', // Add this line
     // ... rest of options
   });
   ```

4. **Restart the backend server**

### Solution 3: Use a Different Video Source (Temporary)

For testing purposes, you can use videos that don't have strict restrictions:
- Creative Commons videos
- Your own uploaded videos
- Videos from smaller channels

### Testing the Fix

After updating yt-dlp, test the download:

```bash
# Test download directly
yt-dlp -f 'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best' \
  --merge-output-format mp4 \
  -o "/tmp/test_%(id)s.mp4" \
  "https://youtu.be/XmCsiXWpvxo"

# Check file size
ls -lh /tmp/test_*.mp4
```

If this works, then restart your backend and try the app again.

## Other Common Issues

### Issue: Backend won't start
**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use fuser
fuser -k 3001/tcp

# Restart backend
cd backend && npm run dev
```

### Issue: Frontend shows CORS errors
**Error:** `Access to fetch at 'http://localhost:3001' has been blocked by CORS policy`

**Solution:**
Check that backend CORS is set to correct port in `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:5173',  // Must match frontend port
  credentials: true
}));
```

### Issue: OAuth authentication fails
**Error:** `redirect_uri_mismatch`

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 credentials
3. Ensure redirect URI exactly matches: `http://localhost:3001/api/youtube/oauth2callback`
4. Clear browser cookies and try again

### Issue: Gemini API rate limit
**Error:** `429 Too Many Requests`

**Solution:**
- Wait a few minutes before retrying
- Check your API quota in [Google AI Studio](https://makersuite.google.com/)
- Consider implementing rate limiting in your code

### Issue: ffmpeg errors
**Error:** `ffmpeg: command not found` or `codec not supported`

**Solution:**
```bash
# Reinstall ffmpeg with all codecs
sudo apt install ffmpeg libavcodec-extra

# Or on macOS
brew reinstall ffmpeg
```

### Issue: Videos folder permission denied
**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Fix permissions
chmod -R 755 backend/videos/
```

### Issue: Large video downloads timing out

**Solution:**
Increase timeout in video.service.ts or use smaller videos:
```typescript
await youtubeDl(normalizedVideoUrl, {
  // ... existing options
  timeout: 300000, // 5 minutes
});
```

## Checking Your Setup

Run these commands to verify your environment:

```bash
# Check Node version (need >= 18)
node --version

# Check npm version (need >= 9)
npm --version

# Check yt-dlp version (need >= 2024.10)
yt-dlp --version

# Check ffmpeg
ffmpeg -version | head -1

# Check if backend dependencies installed
cd backend && npm list youtube-dl-exec fluent-ffmpeg

# Check if .env.local exists and has keys
ls -la .env.local && grep -c API_KEY .env.local
```

## Still Having Issues?

1. **Check the logs:**
   - Backend terminal for server errors
   - Browser console (F12) for frontend errors
   - Network tab for API call failures

2. **Try a different video:**
   - Use a short video (<5 minutes)
   - Try a different YouTube channel
   - Ensure video isn't age-restricted or region-locked

3. **Clear cache and restart:**
   ```bash
   # Clear downloaded videos
   rm -rf backend/videos/downloaded/*
   rm -rf backend/videos/extracted/*

   # Restart services
   killall -9 node
   ./start-dev.sh
   ```

4. **Check GitHub issues:**
   - [yt-dlp issues](https://github.com/yt-dlp/yt-dlp/issues)
   - Search for "403 Forbidden" or "nsig extraction failed"

## Important Notes

- ⚠️ **YouTube's restrictions change frequently** - yt-dlp updates regularly to work around them
- ⚠️ **Always keep yt-dlp updated** - older versions will stop working
- ⚠️ **Respect YouTube's Terms of Service** - only download videos you have rights to
- ⚠️ **Be mindful of rate limits** - don't download too many videos too quickly

## Getting Help

If none of these solutions work:
1. Check your yt-dlp version first: `yt-dlp --version`
2. Try updating to the latest version
3. Test yt-dlp directly outside the app
4. Check if the video can be downloaded manually
5. Look for recent yt-dlp GitHub issues about YouTube changes
