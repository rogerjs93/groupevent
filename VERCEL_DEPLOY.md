# Vercel Deployment Guide

## Quick Deploy to Vercel

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `rogerjs93/groupevent`
   - Vercel will auto-detect the settings

3. **Add Environment Variable**:
   - In Vercel project settings → Environment Variables
   - Add: `GITHUB_TOKEN` = your GitHub Personal Access Token
   - This token is used ONLY by the serverless functions (secure!)

4. **Deploy!**
   - Click "Deploy"
   - Your app will be live at: `https://groupevent-xxx.vercel.app`

## How It Works

### Architecture:
```
User Browser
    ↓
Vercel Frontend (React App)
    ↓
Vercel Serverless API (/api/events, /api/users)
    ↓
GitHub Repository (data/events.json, data/users.json)
```

### Security:
- ✅ GitHub token is ONLY in Vercel environment variables (serverless backend)
- ✅ Token is NEVER exposed to client-side JavaScript
- ✅ Users don't need authentication - just vote!
- ✅ All data persists in your GitHub repo

### API Endpoints:

- `GET /api/events` - Fetch all events
- `POST /api/events` - Create new event
- `PUT /api/events` - Update event (votes)
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create new user

## Local Development

1. **Run Vercel Dev Server**:
   ```bash
   vercel dev
   ```
   This runs both the frontend AND the serverless functions locally!

2. **Add .env file** (for local API testing):
   ```bash
   GITHUB_TOKEN=your_token_here
   ```

3. **Access app**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/events

## Benefits over GitHub Pages Only:

- ✅ Secure token storage (not in browser)
- ✅ Real-time data persistence across all users
- ✅ No CORS issues
- ✅ Faster than GitHub API direct calls
- ✅ Free hosting with Vercel
- ✅ Automatic HTTPS
- ✅ Global CDN

## Troubleshooting

### API returns 500 error:
- Check that `GITHUB_TOKEN` is set in Vercel environment variables
- Verify token has `repo` scope permissions

### Data not persisting:
- Ensure `data/events.json` and `data/users.json` exist in GitHub repo
- Check Vercel function logs for errors

### CORS errors:
- The API already has CORS enabled for all origins
- If issues persist, check browser console for specific error
