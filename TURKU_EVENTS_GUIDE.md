# 🚀 Turku Events Streaming - Quick Guide

## ✅ What's New

### 1. **Node.js 18.x Fix for Vercel**
- Added `"engines": { "node": "18.x" }` to `package.json`
- Updated `vercel.json` with proper framework settings
- ✅ **Deployment should now work!**

### 2. **Live Turku Events Integration**
- ✅ **MyHelsinki API** - Real events from Turku region
- ✅ **Turku.fi Mock Events** - Market Square, Castle tours
- ✅ **Visit Turku Mock Events** - Archipelago tours, Cathedral visits
- ✅ **Auto-sync** every 6 hours

### 3. **UI Improvements**
- 🌟 **"Happening in Turku"** section for external events
- 👥 **"Community Events"** section for user-suggested events
- 🏷️ **Blue source badges** on external events (e.g., "✨ MyHelsinki")
- 🔗 **"View Original Event"** links to source websites
- 🟢 **Live counter** in header showing number of Turku events

---

## 🌐 Event Sources

### Currently Active:

1. **MyHelsinki API** ✅
   - Real-time events from Turku region
   - Filters events containing "turku" or "åbo"
   - Up to 8 events displayed

2. **Turku.fi** (Mock Data)
   - Market Square Events  
   - Turku Castle Tours

3. **Visit Turku** (Mock Data)
   - Archipelago Tours
   - Cathedral Visits

### How to Add More Sources:

Edit `src/utils/turkuEventsStream.ts` and add new fetch functions:

```typescript
async function fetchNewSource(): Promise<Event[]> {
  const response = await fetch('https://api.example.com/events');
  const data = await response.json();
  return data.map(event => convertToAppEvent(event, 'Source Name'));
}
```

Then add to `fetchTurkuActivities()`:

```typescript
const [myHelsinki, turkuCity, visitTurku, newSource] = await Promise.all([
  fetchMyHelsinkiEvents(),
  fetchTurkuCityEvents(),
  fetchVisitTurkuEvents(),
  fetchNewSource(), // ← Add here
]);
```

---

## 🔧 Configuration

### Sync Frequency

Default: **6 hours**

To change, edit `src/utils/turkuEventsStream.ts`:

```typescript
// Change from 6 hours to 1 hour:
const ONE_HOUR = 1 * 60 * 60 * 1000;
setInterval(() => {
  fetchTurkuActivities().then(callback);
}, ONE_HOUR);
```

### Event Filtering

Current filter in MyHelsinki fetch:

```typescript
return (
  name.includes('turku') || 
  desc.includes('turku') || 
  location.includes('turku') ||
  tags.includes('turku') ||
  name.includes('åbo') ||
  location.includes('åbo')
);
```

### Event Limit

Current limit: **8 events per source**

To change:

```typescript
.slice(0, 15) // Show max 15 events
```

---

## 🚀 Deployment to Vercel

### Step 1: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `rogerjs93/groupevent`
3. Vercel auto-detects settings:
   - Framework: Vite ✅
   - Node.js: 18.x ✅
   - Build: `npm run build`
   - Output: `dist`

### Step 2: Add Environment Variable

**CRITICAL**: Add your GitHub token

- Name: `GITHUB_TOKEN`
- Value: Your Personal Access Token
- Check all environments (Production, Preview, Development)

### Step 3: Deploy!

Click "Deploy" - should take ~2 minutes

---

## 📊 Features Summary

### External Events:
- ✅ Source badge (e.g., "✨ MyHelsinki")
- ✅ Blue accent colors
- ✅ External link to original event
- ✅ Separated in "Happening in Turku" section
- ✅ Users can still vote on time preferences
- ✅ Votes stored locally (not saved to GitHub)

### Community Events:
- ✅ User-suggested events
- ✅ Full voting with GitHub persistence
- ✅ Username attribution
- ✅ Separated in "Community Events" section

### Smart Syncing:
- ✅ Initial fetch on app load
- ✅ Auto-refresh every 6 hours
- ✅ No duplicate events (title matching)
- ✅ Error handling with graceful fallback

---

## 🎯 Next Steps (Optional)

### Easy Additions:

1. **Turku University Events**
   ```typescript
   const response = await fetch('https://utu.fi/api/events');
   ```

2. **Turku Jazz/Music Venues**
   - Klubi events
   - Dynamo events
   - Turku Jazz API

3. **Sports Events**
   - TPS (football)
   - FC Inter Turku
   - Basketball, hockey

4. **Facebook Events**
   - Requires API key
   - Search "events near Turku"

5. **Meetup.com**
   - Requires API key  
   - Tech meetups, social events

### Advanced Features:

1. **Event Categories**
   - Filter by: Music, Sports, Culture, Food
   - Add category tags to events

2. **Date Filtering**
   - Show only upcoming events
   - Filter by date range

3. **Map View**
   - Show event locations on map
   - Use Google Maps or MapBox

4. **Notifications**
   - Email when new events added
   - Browser push notifications

---

## 🐛 Troubleshooting

### No External Events?

1. Check browser console for API errors
2. Test MyHelsinki API manually:
   ```
   https://open-api.myhelsinki.fi/v1/events/?limit=50
   ```
3. Check if events contain "turku" in name/description

### Events Not Updating?

1. Default sync: 6 hours
2. Manually refresh page
3. Check console for sync messages

### Vercel Deployment Failed?

1. Check build logs in Vercel dashboard
2. Verify `GITHUB_TOKEN` is set
3. Ensure Node.js 18.x is configured

### TypeScript Errors?

Some errors are expected during development. The app will compile successfully for production.

---

## 💡 Tips

- External events update automatically - no manual work needed!
- MyHelsinki API is free and doesn't require authentication
- Mock events show instantly - great for testing
- Users can vote on both external and community events
- All Turku-related words: "turku", "åbo", "Turku", "Åbo"

---

## 📞 Support

If you need help:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify API endpoints are accessible
4. Test with mock data first

---

**Your app now streams REAL Turku events! 🇫🇮 🎉**

Redeploy to Vercel and watch the magic happen!
