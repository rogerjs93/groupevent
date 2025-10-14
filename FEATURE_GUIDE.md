# How the Specific Time Selection Works

## User Flow

### Step 1: View Events
Users see all available events with:
- Event title and description
- Who suggested it
- Current interest level (percentage)
- Vote counts

### Step 2: Express Interest
Users click either:
- ✓ **Interested** - Proceeds to time selection
- ✗ **Not Interested** - Vote is recorded, done

### Step 3: Choose Time Slot (New!)
If interested, users select a general time period:
- 🌅 **Morning**: 6:00 AM - 11:30 AM
- ☀️ **Afternoon**: 12:00 PM - 5:30 PM  
- 🌆 **Evening**: 6:00 PM - 11:30 PM
- 🌙 **Night**: 12:00 AM - 5:30 AM

Each time slot shows how many people voted for it.

### Step 4: Pick Specific Time (New!)
After choosing a time slot, users see all available times in 30-minute intervals:

**Example for Evening:**
```
6:00 PM    6:30 PM    7:00 PM
7:30 PM    8:00 PM    8:30 PM
9:00 PM    9:30 PM    10:00 PM
10:30 PM   11:00 PM   11:30 PM
```

Each time shows:
- The time in 12-hour format
- Current vote count

### Step 5: View Results
After voting, users see:
- Their selected time slot
- Their specific time choice
- **Most Popular Times** for that event (top 3)

## Example

**Event**: "Board Game Night at Café"

1. Alice clicks **"Interested"** ✓
2. She selects **"Evening"** 🌆
3. She picks **"7:00 PM"**
4. Vote saved! She sees:
   - Time Slot: Evening
   - Specific Time: 7:00 PM
   - Most Popular Times: 7:00 PM (3 votes), 8:00 PM (2 votes), 6:30 PM (1 vote)

## Benefits

✅ **More Precise Planning**: Know exact meeting times
✅ **Group Coordination**: See what time works for most people
✅ **Flexibility**: Still shows general time slot preferences
✅ **No Confusion**: Can't vote twice - uses cookies to track
✅ **Visual Feedback**: Always see popular choices

## Technical Details

### Data Structure

Each event stores:
```typescript
{
  timeSlots: [
    {
      time: 'evening',
      votes: 5,
      specificTimes: [
        { time: '18:00', votes: 1 },
        { time: '18:30', votes: 0 },
        { time: '19:00', votes: 3 },
        // ... more times
      ]
    }
  ]
}
```

### Cookie Storage

User votes are stored as:
```typescript
{
  eventId: 'event-123',
  interested: true,
  timeSlot: 'evening',
  specificTime: '19:00'
}
```

This prevents:
- ❌ Voting multiple times
- ❌ Changing votes after submission
- ✅ Maintains privacy (no login required)

## Time Formats

- **Storage**: 24-hour format (18:00)
- **Display**: 12-hour format (6:00 PM)
- **Intervals**: 30 minutes

## Popular Times Display

Shows top 3 most voted times for each event's time slot:
- Helps users see consensus
- Updates in real-time
- Only shows times with votes > 0

---

This feature makes event planning much more precise while keeping the interface simple and intuitive!
