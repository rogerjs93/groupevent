import { Event } from '../types';

// External event data structure from APIs
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

// Convert external event to our Event format
function convertToAppEvent(externalEvent: ExternalEvent, source: string, city: string): Event {
  const now = Date.now();
  const title = externalEvent.name?.en || externalEvent.name?.fi || 'Event';
  const description = 
    externalEvent.description?.intro || 
    externalEvent.description?.body || 
    externalEvent.description?.en || 
    externalEvent.description?.fi || 
    'Event happening in Finland';
  
  return {
    id: `external-${source}-${externalEvent.id || now}`,
    title: title.substring(0, 100), // Limit title length
    description: description.substring(0, 300), // Limit description length
    suggestedBy: source,
    city: city, // Add city information
    timeSlots: {
      morning: { votes: 0, specificTimes: {} },
      afternoon: { votes: 0, specificTimes: {} },
      evening: { votes: 0, specificTimes: {} },
      night: { votes: 0, specificTimes: {} },
    },
    interestedCount: 0,
    notInterestedCount: 0,
    createdAt: now,
    isExternal: true,
    externalUrl: externalEvent.info_url,
    source: source,
  };
}

// List of supported cities
export const SUPPORTED_CITIES = [
  { id: 'turku', name: 'Turku', aliases: ['turku', 'åbo'] },
  { id: 'helsinki', name: 'Helsinki', aliases: ['helsinki', 'helsingfors'] },
  { id: 'tampere', name: 'Tampere', aliases: ['tampere', 'tammerfors'] },
  { id: 'oulu', name: 'Oulu', aliases: ['oulu', 'uleåborg'] },
  { id: 'espoo', name: 'Espoo', aliases: ['espoo', 'esbo'] },
  { id: 'vantaa', name: 'Vantaa', aliases: ['vantaa', 'vanda'] },
];

// Fetch events from MyHelsinki API - gets events from all Finnish cities
async function fetchMyHelsinkiEvents(): Promise<Event[]> {
  try {
    // Use our Vercel serverless function proxy to bypass CORS
    // In production, this will be /api/myhelsinki
    // In development, you can use 'vercel dev' to test locally
    const response = await fetch('/api/myhelsinki?limit=100');
    
    if (!response.ok) {
      console.warn('MyHelsinki proxy API returned:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Define type for events with city info
    interface EventWithCity {
      event: ExternalEvent;
      city: string;
      isTurku: boolean;
    }
    
    // Process all events and detect their city
    const eventsWithCity: EventWithCity[] = (data.data || [])
      .map((event: ExternalEvent): EventWithCity => {
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
        
        // Detect which city the event belongs to
        let detectedCity = 'Helsinki'; // Default to Helsinki
        let isTurku = false;
        
        for (const cityInfo of SUPPORTED_CITIES) {
          const cityMatch = cityInfo.aliases.some(alias => 
            name.includes(alias) || 
            desc.includes(alias) || 
            location.includes(alias) ||
            tags.includes(alias)
          );
          
          if (cityMatch) {
            detectedCity = cityInfo.name;
            if (cityInfo.id === 'turku') {
              isTurku = true;
            }
            break;
          }
        }
        
        return {
          event,
          city: detectedCity,
          isTurku
        };
      });
    
    // Sort: Turku events first, then others
    const sorted = eventsWithCity.sort((a, b) => {
      if (a.isTurku && !b.isTurku) return -1;
      if (!a.isTurku && b.isTurku) return 1;
      return 0;
    });
    
    // Take top 20 events (prioritizing Turku)
    return sorted
      .slice(0, 20)
      .map(({ event, city }) => convertToAppEvent(event, 'MyHelsinki', city));
  } catch (error) {
    console.error('Error fetching MyHelsinki events:', error);
    return [];
  }
}

// Mock Turku city events (replace with real API when available)
async function fetchTurkuCityEvents(): Promise<Event[]> {
  try {
    const mockEvents: Event[] = [
      {
        id: `turku-market-${Date.now()}`,
        title: '🏛️ Turku Market Square Events',
        description: 'Weekly happenings at the historic Turku Market Square - fresh produce, local crafts, and seasonal activities',
        suggestedBy: 'Turku.fi',
        city: 'Turku',
        timeSlots: {
          morning: { votes: 0, specificTimes: {} },
          afternoon: { votes: 0, specificTimes: {} },
          evening: { votes: 0, specificTimes: {} },
          night: { votes: 0, specificTimes: {} },
        },
        interestedCount: 0,
        notInterestedCount: 0,
        createdAt: Date.now(),
        isExternal: true,
        externalUrl: 'https://www.turku.fi/en/turku-market-square',
        source: 'Turku.fi',
      },
      {
        id: `turku-castle-${Date.now()}`,
        title: '🏰 Turku Castle Tours',
        description: 'Explore the medieval Turku Castle, one of Finland\'s most significant historical monuments',
        suggestedBy: 'Turku.fi',
        city: 'Turku',
        timeSlots: {
          morning: { votes: 0, specificTimes: {} },
          afternoon: { votes: 0, specificTimes: {} },
          evening: { votes: 0, specificTimes: {} },
          night: { votes: 0, specificTimes: {} },
        },
        interestedCount: 0,
        notInterestedCount: 0,
        createdAt: Date.now(),
        isExternal: true,
        externalUrl: 'https://www.turku.fi/en/turku-castle',
        source: 'Turku.fi',
      },
    ];
    
    return mockEvents;
  } catch (error) {
    console.error('Error creating Turku city events:', error);
    return [];
  }
}

// Mock VisitTurku events
async function fetchVisitTurkuEvents(): Promise<Event[]> {
  try {
    const mockEvents: Event[] = [
      {
        id: `visit-archipelago-${Date.now()}`,
        title: '⛵ Turku Archipelago Tour',
        description: 'Explore the stunning Turku archipelago by boat. Experience the unique island culture and beautiful Finnish nature.',
        suggestedBy: 'Visit Turku',
        city: 'Turku',
        timeSlots: {
          morning: { votes: 0, specificTimes: {} },
          afternoon: { votes: 0, specificTimes: {} },
          evening: { votes: 0, specificTimes: {} },
          night: { votes: 0, specificTimes: {} },
        },
        interestedCount: 0,
        notInterestedCount: 0,
        createdAt: Date.now(),
        isExternal: true,
        externalUrl: 'https://www.visitturku.fi/en/see-and-experience/archipelago/',
        source: 'Visit Turku',
      },
      {
        id: `visit-cathedral-${Date.now()}`,
        title: '⛪ Turku Cathedral Visit',
        description: 'Visit the Mother Church of Finland, a stunning example of Finnish medieval architecture dating back to the 13th century.',
        suggestedBy: 'Visit Turku',
        city: 'Turku',
        timeSlots: {
          morning: { votes: 0, specificTimes: {} },
          afternoon: { votes: 0, specificTimes: {} },
          evening: { votes: 0, specificTimes: {} },
          night: { votes: 0, specificTimes: {} },
        },
        interestedCount: 0,
        notInterestedCount: 0,
        createdAt: Date.now(),
        isExternal: true,
        externalUrl: 'https://www.visitturku.fi/en/see-and-experience/sights/turku-cathedral/',
        source: 'Visit Turku',
      },
    ];
    
    return mockEvents;
  } catch (error) {
    console.error('Error creating VisitTurku events:', error);
    return [];
  }
}

// Main function to fetch activities from all cities (prioritizing Turku)
export async function fetchTurkuActivities(): Promise<Event[]> {
  try {
    const [myHelsinkiEvents, turkuCityEvents, visitTurkuEvents] = await Promise.all([
      fetchMyHelsinkiEvents(),
      fetchTurkuCityEvents(),
      fetchVisitTurkuEvents(),
    ]);

    // Combine all events (MyHelsinki already prioritizes Turku)
    const allEvents = [
      ...myHelsinkiEvents,
      ...turkuCityEvents,
      ...visitTurkuEvents,
    ];

    // Remove duplicates based on title similarity
    const uniqueEvents = allEvents.filter(
      (event, index, self) =>
        index === self.findIndex((e) => 
          e.title.toLowerCase().trim() === event.title.toLowerCase().trim()
        )
    );

    console.log(`✅ Fetched ${uniqueEvents.length} events from multiple cities (Turku prioritized)`);
    
    return uniqueEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Periodic event sync
export function startEventSync(callback: (events: Event[]) => void) {
  // Initial fetch
  fetchTurkuActivities().then(callback);

  // Fetch every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const interval = setInterval(() => {
    fetchTurkuActivities().then(callback);
  }, SIX_HOURS);

  // Return cleanup function
  return () => clearInterval(interval);
}
