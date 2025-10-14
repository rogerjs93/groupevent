# 🚀 GitHub Pages Deployment Guide

Complete guide to deploy your Event Organizer app to GitHub Pages with data persistence.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js installed
- Repository created at: `https://github.com/rogerjs93/groupevent`

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd "c:\Users\roger\Desktop\Roger\Projects\Software engineering\eventorganizer"
git init
git add .
git commit -m "Initial commit: Event Organizer with enhanced UI"
```

### 1.2 Connect to GitHub

```bash
git remote add origin https://github.com/rogerjs93/groupevent.git
git branch -M main
git push -u origin main
```

## Step 2: Create Data Files in Repository

These files store events and users. Create them directly on GitHub:

### 2.1 Create `data/events.json`

1. Go to: `https://github.com/rogerjs93/groupevent`
2. Click **"Add file"** → **"Create new file"**
3. File path: `data/events.json`
4. Content:
   ```json
   []
   ```
5. Commit message: "Initialize events data file"
6. Click **"Commit new file"**

### 2.2 Create `data/users.json`

1. Click **"Add file"** → **"Create new file"**
2. File path: `data/users.json`
3. Content:
   ```json
   []
   ```
4. Commit message: "Initialize users data file"
5. Click **"Commit new file"**

## Step 3: Set Up GitHub Personal Access Token

### 3.1 Create Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Token name: `Event Organizer - Group Event`
4. Expiration: Choose as needed (90 days, 1 year, or no expiration)
5. Select scopes:
   - ✅ **`repo`** (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Click **"Generate token"**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### 3.2 Add Token to Repository Secrets

1. Go to: `https://github.com/rogerjs93/groupevent/settings/secrets/actions`
2. Click **"New repository secret"**
3. Name: `GH_TOKEN`
4. Value: Paste your Personal Access Token
5. Click **"Add secret"**

### 3.3 Create Local Environment File

```bash
# In your project root
copy .env.example .env.local
```

Edit `.env.local`:
```env
VITE_GITHUB_TOKEN=ghp_your_token_here
```

⚠️ **IMPORTANT**: Never commit `.env.local` to git!

## Step 4: Enable GitHub Pages

### 4.1 Configure Pages

1. Go to: `https://github.com/rogerjs93/groupevent/settings/pages`
2. **Source**: Select **"GitHub Actions"**
3. Save

### 4.2 Verify Workflow File

The file `.github/workflows/deploy.yml` should already exist with this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Step 5: Deploy

### 5.1 Push to GitHub (Automatic Deployment)

```bash
git add .
git commit -m "Ready for deployment"
git push
```

The GitHub Action will automatically:
1. Build your app
2. Deploy to GitHub Pages

### 5.2 Monitor Deployment

1. Go to: `https://github.com/rogerjs93/groupevent/actions`
2. Click on the latest workflow run
3. Wait for all steps to complete (usually 1-2 minutes)

### 5.3 Access Your App

Once deployed, your app will be live at:

**🎉 https://rogerjs93.github.io/groupevent/**

## Step 6: Test Data Persistence

### 6.1 Test Event Creation

1. Visit your live app
2. Click **"+ Suggest Event"**
3. Fill in:
   - Title: "Test Event"
   - Description: "Testing data persistence"
4. Submit

### 6.2 Verify Data Storage

1. Go to: `https://github.com/rogerjs93/groupevent/blob/main/data/events.json`
2. You should see your test event in the JSON file

### 6.3 Test Voting

1. Click "Interested" on an event
2. Select a time slot
3. Choose a specific time
4. Reload the page
5. Your vote should persist (cookie-based)

### 6.4 Test Username

1. Click **"Set Username"**
2. Enter a username
3. Check: `https://github.com/rogerjs93/groupevent/blob/main/data/users.json`

## How Data Persistence Works

### GitHub as Backend

```
User Action → JavaScript → GitHub API → Repository File Update
                                     ↓
                              data/events.json
                              data/users.json
```

### Cookie-Based Voting

```
User Vote → Cookie Storage (browser)
          ↓
    Vote persists across sessions
    No server needed!
```

## Troubleshooting

### ❌ Issue: Build Fails

**Check:**
1. Is `GH_TOKEN` secret set correctly?
2. Are all dependencies installed?
3. Check GitHub Actions logs for errors

**Solution:**
```bash
# Locally test the build
npm run build
```

### ❌ Issue: 404 Error on GitHub Pages

**Check:**
1. Is GitHub Pages enabled?
2. Is the source set to "GitHub Actions"?
3. Has the deployment completed?

**Solution:**
Wait 2-3 minutes after deployment completes.

### ❌ Issue: Cannot Save Events

**Check:**
1. Do `data/events.json` and `data/users.json` exist?
2. Is the GitHub token valid?
3. Does the token have `repo` scope?

**Solution:**
```bash
# Test API locally
# Check browser console for errors
```

### ❌ Issue: CORS Errors

**This shouldn't happen with GitHub API, but if it does:**

The app uses GitHub's REST API which allows CORS. If you see errors:
1. Check that the repository is public
2. Verify the token is included in requests
3. Check browser console for specific error

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build locally
npm run build

# Deploy using gh-pages
npm run deploy
```

This will deploy to the `gh-pages` branch.

## Updating Your App

### After Making Changes

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Actions will automatically rebuild and deploy!

## Performance Tips

### 1. Rate Limits

GitHub API has rate limits:
- Authenticated: 5,000 requests/hour
- Per repository: Limits on file updates

For high traffic, consider:
- Caching responses
- Batch updates
- Using GitHub Discussions API

### 2. Data Structure

Current structure works well for small to medium communities.

For larger scale:
- Consider pagination
- Use separate files per event
- Implement data archiving

## Security Best Practices

### ✅ DO:
- Use repository secrets for tokens
- Set token expiration
- Use minimal required scopes
- Review token activity regularly

### ❌ DON'T:
- Commit tokens to git
- Share your `.env.local` file
- Use tokens in public code
- Give tokens unnecessary permissions

## Monitoring

### Check Deployment Status

```bash
# View recent commits
git log --oneline -5

# Check remote status
git remote -v
```

### View Live Data

- Events: `https://github.com/rogerjs93/groupevent/blob/main/data/events.json`
- Users: `https://github.com/rogerjs93/groupevent/blob/main/data/users.json`

## Next Steps

1. ✅ Share your app URL with the Turku community
2. ✅ Monitor events and participation
3. ✅ Integrate real Turku events API (update `src/utils/turkuApi.ts`)
4. ✅ Add analytics to track popular events
5. ✅ Consider adding event categories or tags

## Support

### Resources
- GitHub Pages Docs: https://docs.github.com/pages
- GitHub API Docs: https://docs.github.com/rest
- Vite Docs: https://vitejs.dev

### Getting Help
1. Check GitHub Actions logs
2. Review browser console
3. Check this guide
4. Open an issue on GitHub

---

## ✨ Your App is Live!

Congratulations! Your Event Organizer is now live and ready to help the Turku community organize amazing activities!

**Live URL**: https://rogerjs93.github.io/groupevent/

🎉 Happy organizing!
