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
function convertToAppEvent(externalEvent: ExternalEvent, source: string): Event {
  const now = Date.now();
  const title = externalEvent.name?.en || externalEvent.name?.fi || 'Turku Event';
  const description = 
    externalEvent.description?.intro || 
    externalEvent.description?.body || 
    externalEvent.description?.en || 
    externalEvent.description?.fi || 
    'Event happening in Turku';
  
  return {
    id: `external-${source}-${externalEvent.id || now}`,
    title: title.substring(0, 100), // Limit title length
    description: description.substring(0, 300), // Limit description length
    suggestedBy: source,
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

// Fetch events from MyHelsinki API with city filter
async function fetchMyHelsinkiEvents(cityFilter?: string): Promise<Event[]> {
  try {
    const response = await fetch(
      'https://open-api.myhelsinki.fi/v1/events/?limit=100'
    );
    
    if (!response.ok) {
      console.warn('MyHelsinki API returned:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Get city aliases for filtering
    const selectedCity = SUPPORTED_CITIES.find(c => c.id === cityFilter);
    const cityAliases = selectedCity?.aliases || ['turku', 'åbo']; // Default to Turku
    
    return (data.data || [])
      .filter((event: ExternalEvent) => {
        // Filter for city-related events
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
        
        // Check if any city alias matches
        return cityAliases.some(alias => 
          name.includes(alias) || 
          desc.includes(alias) || 
          location.includes(alias) ||
          tags.includes(alias)
        );
      })
      .slice(0, 15) // Limit to 15 events
      .map((event: ExternalEvent) => convertToAppEvent(event, `MyHelsinki-${selectedCity?.name || 'Turku'}`));
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

// Main function to fetch activities with city filter
export async function fetchTurkuActivities(cityFilter: string = 'turku'): Promise<Event[]> {
  try {
    const selectedCity = SUPPORTED_CITIES.find(c => c.id === cityFilter);
    const cityName = selectedCity?.name || 'Turku';
    
    const [myHelsinkiEvents, turkuCityEvents, visitTurkuEvents] = await Promise.all([
      fetchMyHelsinkiEvents(cityFilter),
      fetchTurkuCityEvents(),
      fetchVisitTurkuEvents(),
    ]);

    // Combine all events
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

    console.log(`✅ Fetched ${uniqueEvents.length} ${cityName} events from ${[
      myHelsinkiEvents.length && 'MyHelsinki',
      turkuCityEvents.length && 'Turku.fi',
      visitTurkuEvents.length && 'Visit Turku'
    ].filter(Boolean).join(', ')}`);
    
    return uniqueEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Periodic event sync with city filter
export function startEventSync(callback: (events: Event[]) => void, cityFilter: string = 'turku') {
  // Initial fetch
  fetchTurkuActivities(cityFilter).then(callback);

  // Fetch every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const interval = setInterval(() => {
    fetchTurkuActivities(cityFilter).then(callback);
  }, SIX_HOURS);

  // Return cleanup function
  return () => clearInterval(interval);
}
