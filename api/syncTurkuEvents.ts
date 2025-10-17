import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ExternalEvent {
  id?: string;
  name?: { fi?: string; en?: string; [key: string]: string | undefined };
  description?: { intro?: string; body?: string; fi?: string; en?: string; [key: string]: string | undefined };
  event_dates?: {
    starting_day?: string;
    ending_day?: string;
  };
  location?: {
    address?: { street_address?: string; locality?: string };
  };
  info_url?: string;
  tags?: Array<{ name?: string }>;
}

interface Event {
  id: string;
  title: string;
  description: string;
  suggestedBy: string;
  timeSlots: {
    morning: { votes: number; specificTimes: { [time: string]: number } };
    afternoon: { votes: number; specificTimes: { [time: string]: number } };
    evening: { votes: number; specificTimes: { [time: string]: number } };
    night: { votes: number; specificTimes: { [time: string]: number } };
  };
  interestedCount: number;
  notInterestedCount: number;
  createdAt: number;
  isExternal?: boolean;
  externalUrl?: string;
  source?: string;
  eventDate?: number;
  suggestedTime?: string;
  suggestedTimeSlot?: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'rogerjs93';
const GITHUB_REPO = process.env.GITHUB_REPO || 'groupevent';
const FILE_PATH = 'data/events.json';

// Get file content from GitHub
async function getFileContent(): Promise<{ content: Event[]; sha: string }> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString());
  
  return { content, sha: data.sha };
}

// Update file on GitHub
async function updateFile(events: Event[]): Promise<void> {
  const { sha } = await getFileContent();
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Auto-sync: Add monthly Turku events',
      content: Buffer.from(JSON.stringify(events, null, 2)).toString('base64'),
      sha,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
}

// Convert external event to app event format
function convertToAppEvent(externalEvent: ExternalEvent): Event {
  const now = Date.now();
  const title = externalEvent.name?.en || externalEvent.name?.fi || 'Turku Event';
  const description = 
    externalEvent.description?.intro || 
    externalEvent.description?.body || 
    externalEvent.description?.en || 
    externalEvent.description?.fi || 
    'Event happening in Turku';
  
  // Parse event date if available
  let eventDate: number | undefined;
  if (externalEvent.event_dates?.starting_day) {
    const parsedDate = new Date(externalEvent.event_dates.starting_day);
    if (!isNaN(parsedDate.getTime())) {
      eventDate = parsedDate.getTime();
    }
  }
  
  return {
    id: `turku-monthly-${externalEvent.id || now}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.substring(0, 100),
    description: description.substring(0, 300),
    suggestedBy: 'Turku Events Auto-Sync',
    timeSlots: {
      morning: { votes: 0, specificTimes: {} },
      afternoon: { votes: 0, specificTimes: {} },
      evening: { votes: 0, specificTimes: {} },
      night: { votes: 0, specificTimes: {} },
    },
    interestedCount: 0,
    notInterestedCount: 0,
    createdAt: now,
    isExternal: false, // Make them regular events so votes are saved
    externalUrl: externalEvent.info_url,
    source: 'MyHelsinki Monthly Sync',
    eventDate: eventDate,
    suggestedTime: eventDate ? '18:00' : undefined,
    suggestedTimeSlot: 'evening',
  };
}

// Fetch events from MyHelsinki API
async function fetchTurkuEvents(): Promise<Event[]> {
  try {
    const response = await fetch(
      'https://open-api.myhelsinki.fi/v1/events/?limit=100'
    );
    
    if (!response.ok) {
      console.warn('MyHelsinki API returned:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Filter for upcoming Turku events
    const now = Date.now();
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);
    
    return (data.data || [])
      .filter((event: ExternalEvent) => {
        // Filter for Turku-related events
        const name = (event.name?.fi || event.name?.en || '').toLowerCase();
        const desc = (
          event.description?.intro || 
          event.description?.body || 
          event.description?.fi || 
          event.description?.en || 
          ''
        ).toLowerCase();
        const location = (event.location?.address?.locality || '').toLowerCase();
        const tags = (event.tags || []).map(t => (t.name || '').toLowerCase()).join(' ');
        
        const isTurkuRelated = (
          name.includes('turku') || 
          desc.includes('turku') || 
          location.includes('turku') ||
          tags.includes('turku') ||
          name.includes('åbo') ||
          location.includes('åbo')
        );

        // Check if event is upcoming (within next 30 days)
        if (event.event_dates?.starting_day) {
          const eventDate = new Date(event.event_dates.starting_day).getTime();
          const isUpcoming = eventDate >= now && eventDate <= thirtyDaysFromNow;
          return isTurkuRelated && isUpcoming;
        }
        
        return isTurkuRelated;
      })
      .slice(0, 10) // Limit to 10 new events per month
      .map((event: ExternalEvent) => convertToAppEvent(event));
  } catch (error) {
    console.error('Error fetching Turku events:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Verify authorization (simple secret key check)
      const authHeader = req.headers.authorization;
      const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me';
      
      if (authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch new Turku events
      const newEvents = await fetchTurkuEvents();
      
      if (newEvents.length === 0) {
        return res.status(200).json({ 
          message: 'No new Turku events found',
          added: 0 
        });
      }

      // Get existing events
      const { content: existingEvents } = await getFileContent();
      
      // Filter out duplicates (check by title similarity)
      const uniqueNewEvents = newEvents.filter(newEvent => {
        return !existingEvents.some(existing => 
          existing.title.toLowerCase() === newEvent.title.toLowerCase() &&
          existing.source === newEvent.source
        );
      });

      if (uniqueNewEvents.length === 0) {
        return res.status(200).json({ 
          message: 'All fetched events already exist',
          added: 0,
          fetched: newEvents.length
        });
      }

      // Add new events to existing events
      const updatedEvents = [...existingEvents, ...uniqueNewEvents];
      
      // Update GitHub
      await updateFile(updatedEvents);

      return res.status(200).json({ 
        message: 'Successfully synced Turku events',
        added: uniqueNewEvents.length,
        fetched: newEvents.length,
        events: uniqueNewEvents.map(e => ({ id: e.id, title: e.title }))
      });
    }

    if (req.method === 'GET') {
      // Return last sync info
      return res.status(200).json({ 
        message: 'Turku Events Auto-Sync API',
        endpoint: '/api/syncTurkuEvents',
        method: 'POST',
        auth: 'Bearer token required',
        schedule: 'Monthly (1st of each month at 00:00 UTC)'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Sync error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
}
