import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

// Scopes required for uploading videos to YouTube
const scopes = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly'
];

// GET /api/auth/url
// Generates a URL for the user to authenticate with Google.
router.get('/url', (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  });
  res.json({ url: authorizationUrl });
});

// GET /api/auth/callback
// Handles the callback from Google's OAuth flow.
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    
    // Here you would typically save the tokens to a database associated with the user.
    // For this example, we'll just send them back to the client to be stored in session/local storage.
    // In a real app, DO NOT expose refresh tokens to the client.
    console.log('Authentication successful! Tokens received:', tokens);

    // Redirect user to the frontend clips page or send tokens
    // For a SPA, it's common to redirect to a page that saves the token
    res.redirect(`http://localhost:5173/clips?status=success&access_token=${tokens.access_token}&expiry_date=${tokens.expiry_date}`);

  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Authentication failed.');
  }
});

// POST /api/auth/refresh
// Refreshes an expired access token.
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required.' });
    }

    try {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        res.json({
            accessToken: credentials.access_token,
            expiryDate: credentials.expiry_date
        });
    } catch (error) {
        console.error('Error refreshing access token:', error);
        res.status(500).json({ error: 'Failed to refresh token.' });
    }
});


export default router;