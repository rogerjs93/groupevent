# Event Organizer - Turku Activities

A modern, minimalistic web application for suggesting and voting on community activities in Turku, Finland. Built with React and hosted on GitHub Pages, using the repository itself as a lightweight backend.

## ✨ Features

- **Event Suggestions**: Anyone can suggest activities
- **Two-Step Voting System**: 
  - First, vote if you're interested or not
  - Then, select a time slot (morning, afternoon, evening, night)
  - Finally, choose a specific time (e.g., 18:00, 19:30)
- **Cookie-based Tracking**: Prevents duplicate voting without requiring login
- **Popular Times Display**: See which specific times are most voted for each event
- **Optional Usernames**: Set a username that's stored in the repository
- **Turku Activities Integration**: Automatically imports events from Turku data streams
- **Modern UI**: Clean, minimalistic design with dark mode support
- **No Backend Required**: Uses GitHub repository as data storage

## 🎯 How Voting Works

1. **Interest Vote**: Click "Interested" or "Not Interested"
2. **Time Slot Selection**: If interested, choose a general time slot:
   - 🌅 Morning (6:00 AM - 11:30 AM)
   - ☀️ Afternoon (12:00 PM - 5:30 PM)
   - 🌆 Evening (6:00 PM - 11:30 PM)
   - 🌙 Night (12:00 AM - 5:30 AM)
3. **Specific Time**: Select your preferred specific time within that slot (30-minute intervals)
4. **Results**: See the most popular times for each event

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- GitHub account
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rogerjs93/groupevent.git
   cd groupevent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure GitHub Integration**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   ```

   Update `src/utils/github.ts` with your GitHub details:
   ```typescript
   const GITHUB_OWNER = 'rogerjs93';
   const GITHUB_REPO = 'groupevent';
   ```

4. **Create data directory in your repository**
   
   Create two JSON files in your GitHub repository:
   - `data/events.json` - Initialize with `[]`
   - `data/users.json` - Initialize with `[]`

5. **Update Vite config**
   
   In `vite.config.ts`, update the base URL:
   ```typescript
   base: '/your-repo-name/',
   ```

### Development

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build

Build for production:
```bash
npm run build
```

### Deploy to GitHub Pages

1. **Enable GitHub Pages** in your repository settings (Settings → Pages → Source: GitHub Actions or gh-pages branch)

2. **Deploy**
   ```bash
   npm run deploy
   ```

Your app will be available at `https://rogerjs93.github.io/groupevent/`

## 🎯 How It Works

### Data Storage
- Events and users are stored as JSON files in the repository
- GitHub API is used to read/write data
- No traditional backend server required

### Voting System
- Cookies track user votes to prevent duplicates
- Each vote includes: interest level, time slot, and specific time
- Time slot preferences are tracked separately
- Specific times are available in 30-minute intervals
- Popular times are displayed for each event

### Turku Activities Integration
The app can integrate with various Turku event APIs:
- Turku.fi events API
- VisitFinland API
- Custom data sources

Currently using mock data - update `src/utils/turkuApi.ts` to connect real APIs.

## 📁 Project Structure

```
eventorganizer/
├── src/
│   ├── components/          # React components
│   │   ├── EventCard.tsx    # Event display with voting
│   │   ├── EventList.tsx    # Events grid
│   │   ├── SuggestEvent.tsx # Event creation modal
│   │   └── UsernameModal.tsx# Username setup modal
│   ├── utils/              # Utility functions
│   │   ├── cookies.ts      # Cookie management
│   │   ├── github.ts       # GitHub API integration
│   │   ├── turkuApi.ts     # Turku events API
│   │   └── timeUtils.ts    # Time slot utilities
│   ├── types.ts            # TypeScript types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── data/                   # Data files (in GitHub repo)
│   ├── events.json         # Events database
│   └── users.json          # Users database
├── index.html
├── package.json
└── vite.config.ts
```

## 🔑 GitHub Personal Access Token

To create a GitHub token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo` (Full control of private repositories)
4. Copy the token and add to `.env.local`

**Note**: For production, consider using GitHub Actions or a serverless function to keep the token secure.

## 🎨 Customization

### Styling
- Uses TailwindCSS for styling
- Dark mode support included
- Customize colors in `tailwind.config.js`

### Time Slots
Modify time slots in event creation (`src/components/SuggestEvent.tsx`):
```typescript
timeSlots: [
  { time: 'morning', votes: 0 },
  { time: 'afternoon', votes: 0 },
  { time: 'evening', votes: 0 },
  { time: 'night', votes: 0 },
]
```

## 🔒 Security Considerations

- **GitHub Token**: Don't commit your `.env.local` file
- **Public Repository**: All data is public if your repo is public
- **Cookie Privacy**: Cookies only track votes, no personal data
- **Production**: Consider using GitHub Actions workflows for secure token management

## 🌍 Adding Real Turku Activity Data

Update `src/utils/turkuApi.ts` to integrate real APIs:

```typescript
export const fetchTurkuActivities = async (): Promise<Event[]> => {
  const response = await fetch('https://api.turku.fi/events');
  const data = await response.json();
  
  return data.map(item => ({
    id: `turku-${item.id}`,
    title: item.name,
    description: item.description,
    // ... map other fields
  }));
};
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 💡 Tips

- **Performance**: For many events, consider pagination
- **Moderation**: Add event approval workflow if needed
- **Analytics**: Track popular events and time preferences
- **Notifications**: Add email/push notifications for new events

---

Built with ❤️ for the Turku community
