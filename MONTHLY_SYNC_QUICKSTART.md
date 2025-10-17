# 🎉 Monthly Turku Events Auto-Sync - Setup Guide

## 📋 Overview

The app now automatically fetches and adds upcoming Turku events **once per month** using Vercel Cron Jobs. This keeps your community events fresh with real happenings in Turku!

## 🚀 Quick Setup (Required for Production)

### 1. Set Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

```bash
# Already set (for GitHub data storage)
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=rogerjs93
GITHUB_REPO=groupevent

# NEW - Add this for cron authentication
CRON_SECRET=your_secure_random_string_here
```

**Generate a secure CRON_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any random string generator
```

### 2. Deploy to Vercel

The `vercel.json` file already includes the cron configuration:

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

When you deploy, Vercel will automatically:
- ✅ Register the cron job
- ✅ Schedule it to run on the 1st of every month at 00:00 UTC
- ✅ Display it in your Vercel dashboard under "Cron Jobs"

### 3. Verify Setup

After deployment:

1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. You should see: `/api/syncTurkuEvents` listed
3. Schedule shows: `0 0 1 * *` (monthly on the 1st)
4. Next run date will be displayed

## 🎯 How It Works

### Automatic Monthly Sync

**When:** 1st day of every month at 00:00 UTC (3:00 AM Helsinki time)

**What happens:**
1. 📥 Fetches up to 100 events from MyHelsinki API
2. 🔍 Filters for Turku-related events (mentions "Turku" or "Åbo")
3. 📅 Only includes upcoming events (within next 30 days)
4. 🎲 Selects up to 10 unique new events
5. ✅ Checks for duplicates (by title and source)
6. 💾 Adds new events to `data/events.json` in GitHub
7. 🎉 Events appear in your app as votable community events!

### Event Details

Each synced event includes:
- **Title & Description** (from MyHelsinki)
- **Event Date** (parsed from API)
- **External URL** (link to official event page)
- **Source Attribution**: "MyHelsinki Monthly Sync"
- **Suggested By**: "Turku Events Auto-Sync"
- **Default Time**: 18:00 (evening slot)
- **Voting Enabled**: Yes (saved as regular events, not external)

## 🔧 Manual Sync (Optional)

### Via UI
1. Click the 🗓️ calendar icon in the header
2. View sync status and next scheduled run
3. Click "Trigger Manual Sync Now"
4. Enter your `CRON_SECRET` when prompted

### Via API
```bash
curl -X POST https://your-app.vercel.app/api/syncTurkuEvents \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Response:**
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

## 📊 Monitoring

### Check Sync Logs

1. Vercel Dashboard → Your Project → Deployments
2. Find the latest cron execution
3. Click "View Function Logs"
4. Look for `/api/syncTurkuEvents` execution logs

### Verify Synced Events

**In GitHub:**
- Go to your `groupevent` repo
- Open `data/events.json`
- Look for events with:
  ```json
  {
    "source": "MyHelsinki Monthly Sync",
    "suggestedBy": "Turku Events Auto-Sync",
    "id": "turku-monthly-..."
  }
  ```

**In the App:**
- Synced events appear in "Community Events" sections
- They'll be categorized by date (Upcoming/Happening Soon)
- Look for events suggested by "Turku Events Auto-Sync"

## 🎨 User Experience

### In the App

Users will see:
1. **🗓️ Calendar Button** in header (opens sync status modal)
2. **Auto-Synced Events** in community sections
3. **Full Voting** on all synced events (votes saved to server)
4. **Event Links** to official pages
5. **Date Organization** (automatically categorized)

### Sync Status Modal

Shows:
- ⏰ Next automatic sync date
- 📋 What gets synced (bullet points)
- 🔄 Manual sync button (for admins)
- ✅ Success/error messages after manual sync

## 🔐 Security

### Authentication
- Cron jobs automatically include Vercel's authorization
- Additional `CRON_SECRET` check for manual triggers
- Only authorized requests can trigger sync

### Rate Limiting
- Runs only once per month (automatic)
- Limits to 10 events per sync
- Prevents duplicate additions

### Error Handling
- Gracefully handles API failures
- Returns detailed error messages
- Doesn't break existing events on failure

## 🧪 Testing

### Test Before Production

1. **Set CRON_SECRET locally:**
   ```bash
   # Create .env.local file
   echo "CRON_SECRET=test-secret-123" > .env.local
   ```

2. **Test API endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/syncTurkuEvents \
     -H "Authorization: Bearer test-secret-123"
   ```

3. **Check response:**
   - Should return synced events
   - Check `data/events.json` for new entries
   - Verify events appear in app

## 📅 Schedule Details

**Cron Expression:** `0 0 1 * *`

Breakdown:
- `0` - Minute (0 = :00)
- `0` - Hour (0 = midnight UTC)
- `1` - Day of month (1st)
- `*` - Month (every month)
- `*` - Day of week (any day)

**Real-world schedule:**
- January 1, 00:00 UTC
- February 1, 00:00 UTC
- March 1, 00:00 UTC
- ... and so on

**In Helsinki timezone (UTC+2/+3):**
- Runs at 02:00 or 03:00 local time (depending on DST)

## 🎉 Benefits

### For Users
- ✅ Fresh upcoming events every month
- ✅ Real Turku events to vote on
- ✅ Proper event dates and times
- ✅ Links to official event pages
- ✅ No need to manually add events

### For Maintainers
- ✅ Zero manual work
- ✅ Automatic content refresh
- ✅ Duplicate prevention
- ✅ Error logging in Vercel
- ✅ Full control via manual trigger

## 🔄 Sync Workflow

```
[Vercel Cron Scheduler]
        ↓
[1st of Month, 00:00 UTC]
        ↓
[POST /api/syncTurkuEvents]
        ↓
[Fetch MyHelsinki API]
        ↓
[Filter Turku Events]
        ↓
[Get Existing Events from GitHub]
        ↓
[Remove Duplicates]
        ↓
[Add Unique Events to Array]
        ↓
[Update GitHub data/events.json]
        ↓
[Return Success Report]
        ↓
[Events Auto-Appear in App]
```

## 🛠️ Troubleshooting

### Cron Not Running?
- Check Vercel Dashboard → Cron Jobs
- Verify `vercel.json` is in root directory
- Ensure latest deployment includes cron config
- Check execution logs in Vercel

### No Events Added?
- Could be no new Turku events in MyHelsinki API
- All fetched events might be duplicates
- Check sync logs for detailed info
- Try manual sync to see exact response

### Authorization Errors?
- Verify `CRON_SECRET` is set in Vercel
- Check `GITHUB_TOKEN` has write access
- Ensure token hasn't expired

### Events Not Appearing?
- Check `data/events.json` in GitHub
- Refresh app page (60-second polling)
- Verify events have future dates
- Check browser console for errors

## 📚 Related Documentation

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [MyHelsinki API](https://open-api.myhelsinki.fi/)
- [MONTHLY_SYNC_SETUP.md](./MONTHLY_SYNC_SETUP.md) - Detailed technical docs

## ✅ Checklist

Before going live:

- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Verify cron job appears in Vercel dashboard
- [ ] Test manual sync via UI
- [ ] Check that events appear in app
- [ ] Verify events are votable
- [ ] Confirm duplicate prevention works
- [ ] Monitor first automatic run

## 🎊 You're All Set!

Once deployed with `CRON_SECRET` set, your app will automatically sync fresh Turku events every month. Users will always have new, real events to vote on! 🚀
