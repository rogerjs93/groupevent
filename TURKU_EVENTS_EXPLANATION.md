# Turku Events - Voting & Storage Explanation

## 🌟 Overview
The app displays two types of events:
1. **Community Events** - Created by users, stored in GitHub
2. **Turku Events** - Automatically fetched from MyHelsinki API

## 📊 How Voting Works

### Community Events (User-Created)
- ✅ Stored in: **GitHub repository** (`data/events.json`)
- ✅ Votes persist: **Permanently** (saved to server)
- ✅ Shared across: **All users globally**
- ✅ Synced: Every 60 seconds via API

### Turku Events (External Events)
- ✅ Stored in: **Browser localStorage** (per device)
- ✅ Votes persist: **Locally only** (not shared globally)
- ✅ Visible to: **Only your browser**
- ⚠️ Note: Votes reset if you clear browser data

## 🎯 Why This Approach?

### For Turku Events:
1. **Fresh Content**: Events are fetched from MyHelsinki API every 6 hours
2. **No Duplicate Storage**: External events aren't saved to our GitHub repo
3. **Local Preferences**: Your votes on external events are personal to your device
4. **Performance**: Keeps the GitHub data lean and focused on community events

### Technical Details:
```typescript
// When you vote on a Turku event:
1. Vote is saved to localStorage (instant)
2. Event updates in your view (instant)
3. Votes persist across page refreshes (within same browser)
4. When API refreshes Turku events, your votes are reapplied
```

## 📈 Event Limits

- **MyHelsinki API**: Fetches up to 100 events
- **Filtered for Turku**: Only events mentioning "Turku" or "Åbo"
- **Displayed**: Top 15 Turku-related events
- **Refresh Rate**: Every 6 hours for fresh content

## 🔍 Event Identification

Events marked as external:
- `isExternal: true` flag
- Prefixed with `external-MyHelsinki-{id}`
- Displayed in "🌟 Happening in Turku" section
- Cannot be deleted (managed by external API)

## 💡 Future Improvements

Potential enhancements:
1. ☁️ Store external event votes on server (requires backend changes)
2. 🔄 Real-time sync across users for Turku events
3. 📱 Sync localStorage across devices (requires user accounts)
4. 🎨 Differentiate vote counts (global vs local)

## 🎉 Current Benefits

- ✅ Vote on both community and Turku events
- ✅ Turku event votes persist locally
- ✅ 15 curated Turku events (up from 8)
- ✅ Automatic refresh every 6 hours
- ✅ No interruption during voting (smart polling)
