import { Event } from '../types';

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

// Main function to fetch activities from Turku only
export async function fetchTurkuActivities(): Promise<Event[]> {
  try {
    // Only fetch Turku-specific events (removed MyHelsinki API due to reliability issues)
    const [turkuCityEvents, visitTurkuEvents] = await Promise.all([
      fetchTurkuCityEvents(),
      fetchVisitTurkuEvents(),
    ]);

    // Combine Turku events
    const allEvents = [
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

    console.log(`✅ Fetched ${uniqueEvents.length} Turku events`);
    
    return uniqueEvents;
  } catch (error) {
    console.error('Error fetching Turku events:', error);
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
