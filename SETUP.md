# Setup Guide for Event Organizer

## Step-by-Step Setup Instructions

### 1. GitHub Repository Setup

1. **Your GitHub repository**: `https://github.com/rogerjs93/groupevent`
   - The configuration is already set for this repository
   - Make sure the repository exists and is accessible

2. **Push your code to GitHub**
   ```bash
   cd "c:\Users\roger\Desktop\Roger\Projects\Software engineering\eventorganizer"
   git init
   git add .
   git commit -m "Initial commit: Event Organizer app"
   git branch -M main
   git remote add origin https://github.com/rogerjs93/groupevent.git
   git push -u origin main
   ```

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Token name: `Event Organizer App`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### 3. Configure Repository Secrets (for GitHub Actions)

1. Go to your repository settings
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GH_TOKEN`
5. Value: Paste your Personal Access Token
6. Click "Add secret"

### 4. Update Configuration Files

#### Update `src/utils/github.ts`

The file is already configured:
```typescript
const GITHUB_OWNER = 'rogerjs93';
const GITHUB_REPO = 'groupevent';
```

#### Update `vite.config.ts`

The file is already configured:
```typescript
base: '/groupevent/',
```

### 5. Create Environment File for Local Development

1. Copy the example file:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` and add your token:
   ```env
   VITE_GITHUB_TOKEN=ghp_your_token_here
   ```

### 6. Initialize Data Files in Repository

You need to manually create these files in your GitHub repository:

1. Go to your repository on GitHub
2. Create `data/events.json`:
   - Click "Add file" → "Create new file"
   - Path: `data/events.json`
   - Content: `[]`
   - Commit the file

3. Create `data/users.json`:
   - Click "Add file" → "Create new file"
   - Path: `data/users.json`
   - Content: `[]`
   - Commit the file

### 7. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Select "GitHub Actions"
3. Save

### 8. Test Locally

```bash
npm run dev
```

Visit: http://localhost:5173

### 9. Deploy to GitHub Pages

The app will automatically deploy when you push to the `main` branch. Or manually deploy:

```bash
npm run deploy
```

Your app will be live at: `https://rogerjs93.github.io/groupevent/`

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Make sure all dependencies are installed:
```bash
npm install
```

### Issue: GitHub API returns 404

**Solutions**:
1. Verify the data files exist in your repository
2. Check that `GITHUB_OWNER` and `GITHUB_REPO` are correct
3. Ensure your token has `repo` scope

### Issue: "Rate limit exceeded"

**Solution**: GitHub API has rate limits. Use authenticated requests (token) for higher limits.

### Issue: Changes not deploying

**Solutions**:
1. Check GitHub Actions tab for deployment status
2. Ensure GitHub Pages is enabled
3. Verify the workflow file is in `.github/workflows/deploy.yml`

### Issue: Dark mode not working

**Solution**: The app respects system preferences. Change your OS theme to test.

## Next Steps

1. **Customize the UI**: Modify Tailwind colors in `tailwind.config.js`
2. **Add Real Turku Data**: Update `src/utils/turkuApi.ts` with real API
3. **Add Features**: 
   - Event categories
   - Date/time for events
   - Image uploads
   - Comments system
4. **Improve Security**: Use GitHub Actions to handle API calls server-side

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
npm run deploy       # Deploy to GitHub Pages
```

## API Integration Examples

### Turku Events API (Example)

```typescript
// src/utils/turkuApi.ts
export const fetchTurkuActivities = async (): Promise<Event[]> => {
  try {
    const response = await fetch('https://api.turku.fi/v1/events');
    const data = await response.json();
    
    return data.events.map((event: any) => ({
      id: `turku-${event.id}`,
      title: event.title.fi,
      description: event.description.fi,
      suggestedBy: 'Turku.fi',
      createdAt: event.start_time,
      interestedCount: 0,
      notInterestedCount: 0,
      timeSlots: [
        { time: 'morning', votes: 0 },
        { time: 'afternoon', votes: 0 },
        { time: 'evening', votes: 0 },
        { time: 'night', votes: 0 },
      ],
      source: 'turku-api',
      externalUrl: event.info_url,
    }));
  } catch (error) {
    console.error('Error fetching Turku activities:', error);
    return [];
  }
};
```

## Support

For issues and questions:
- Check the README.md
- Review the code comments
- Open an issue on GitHub

---

Happy organizing! 🎉
