# Monthly Turku Events Auto-Sync 🗓️

## Overview
Automatically fetches and adds upcoming Turku events from the MyHelsinki API once per month.

## 🔄 How It Works

### Automatic Sync
- **Frequency**: 1st day of every month at 00:00 UTC (3:00 AM Helsinki time)
- **Endpoint**: `/api/syncTurkuEvents`
- **Method**: POST (triggered by Vercel Cron)
- **Source**: MyHelsinki API

### What Gets Synced
1. Fetches up to 100 events from MyHelsinki API
2. Filters for Turku-related events (mentions "Turku" or "Åbo")
3. Only includes upcoming events (within next 30 days)
4. Limits to 10 new events per sync
5. Checks for duplicates (compares title and source)
6. Adds unique events to the community events list

### Event Details
Each synced event includes:
- ✅ Title and description
- ✅ Event date (when available)
- ✅ External URL link
- ✅ Source attribution: "MyHelsinki Monthly Sync"
- ✅ Suggested by: "Turku Events Auto-Sync"
- ✅ Default time: 18:00 (evening slot)
- ✅ Voting enabled (stored as regular community events)

## 🎯 Benefits

### For Users
- Fresh upcoming events automatically added
- Vote on real Turku events
- Events have proper dates
- Links to official event pages
- No manual curation needed

### For the App
- Keeps content fresh and relevant
- Reduces manual maintenance
- Provides more voting options
- Increases user engagement

## 🔧 Configuration

### Environment Variables
Set in Vercel dashboard:

```bash
# Required for GitHub operations
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=rogerjs93
GITHUB_REPO=groupevent

# Required for cron authentication
CRON_SECRET=your_secure_random_string_here
```

### Cron Schedule
Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/syncTurkuEvents",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

Schedule format: `0 0 1 * *` = At 00:00 on day 1 of every month
- Minute: 0
- Hour: 0 (UTC)
- Day of month: 1
- Month: * (every month)
- Day of week: * (any day)

## 🧪 Manual Testing

### Test the Sync Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/syncTurkuEvents \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Expected Response
```json
{
  "message": "Successfully synced Turku events",
  "added": 5,
  "fetched": 10,
  "events": [
    { "id": "turku-monthly-...", "title": "Event Name" }
  ]
}
```

### Check API Info
```bash
curl https://your-app.vercel.app/api/syncTurkuEvents
```

## 📊 Monitoring

### Check Sync Status
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to "Cron Jobs"
4. View execution logs and history

### View Synced Events
- Check `data/events.json` in GitHub
- Look for events with:
  - `source: "MyHelsinki Monthly Sync"`
  - `suggestedBy: "Turku Events Auto-Sync"`

## 🔒 Security

### Authorization
- Cron jobs automatically include Vercel's authorization header
- Additional bearer token check with `CRON_SECRET`
- Only POST requests with valid auth can trigger sync

### Rate Limiting
- Runs only once per month
- Limits to 10 events per sync
- Prevents duplicate additions

## 🚀 Deployment

### Initial Setup
1. Deploy to Vercel
2. Set environment variables in Vercel dashboard:
   - `GITHUB_TOKEN`
   - `CRON_SECRET` (generate a secure random string)
3. Ensure `vercel.json` includes cron configuration
4. Deploy will automatically register the cron job

### Verify Setup
1. Check Vercel dashboard → Cron Jobs
2. You should see `/api/syncTurkuEvents` listed
3. Next run date will be shown
4. Can manually trigger for testing

## 📝 Event Format Example

```json
{
  "id": "turku-monthly-abc123-xyz789",
  "title": "Turku Jazz Festival 2025",
  "description": "Annual jazz festival in downtown Turku...",
  "suggestedBy": "Turku Events Auto-Sync",
  "source": "MyHelsinki Monthly Sync",
  "externalUrl": "https://example.com/event",
  "eventDate": 1735689600000,
  "suggestedTime": "18:00",
  "suggestedTimeSlot": "evening",
  "timeSlots": { /* voting structure */ },
  "interestedCount": 0,
  "notInterestedCount": 0,
  "createdAt": 1734480000000,
  "isExternal": false
}
```

## 🔄 Sync Logic Flow

```
1. Cron triggers on 1st of month
   ↓
2. Fetch events from MyHelsinki API
   ↓
3. Filter for Turku-related events
   ↓
4. Filter for upcoming events (next 30 days)
   ↓
5. Limit to 10 events
   ↓
6. Get existing events from GitHub
   ↓
7. Remove duplicates (by title + source)
   ↓
8. Add unique events to existing list
   ↓
9. Update GitHub repository
   ↓
10. Return sync report
```

## 🎉 Result

Users will see:
- New events appear in appropriate sections (Upcoming/Happening Soon)
- Events with proper dates and times
- Votable events (votes saved to server)
- Links to official event pages
- Fresh content automatically every month!

## 📅 Next Sync

After deployment, the first sync will occur on the 1st day of the next month at 00:00 UTC.
