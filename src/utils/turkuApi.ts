import { Event } from '../types';

// This is a placeholder for Turku activity data API
// You can integrate real APIs like:
// - Turku.fi events API
// - VisitFinland API
// - Facebook Events
// - Meetup.com API

export const fetchTurkuActivities = async (): Promise<Event[]> => {
  // TODO: Implement actual API integration
  // For now, returning sample data
  
  // Example implementation (replace with actual API):
  /*
  try {
    const response = await fetch('https://api.turku.fi/events');
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: `turku-${item.id}`,
      title: item.name,
      description: item.description,
      suggestedBy: 'Turku Events API',
      createdAt: item.date,
      interestedCount: 0,
      notInterestedCount: 0,
      timeSlots: [
        { time: 'morning', votes: 0 },
        { time: 'afternoon', votes: 0 },
        { time: 'evening', votes: 0 },
        { time: 'night', votes: 0 },
      ],
      source: 'turku-api',
      externalUrl: item.url,
    }));
  } catch (error) {
    console.error('Error fetching Turku activities:', error);
    return [];
  }
  */

  // Sample mock data for demonstration
  const mockEvents: Event[] = [
    {
      id: 'turku-1',
      title: 'Art Exhibition at Turku Art Museum',
      description: 'Contemporary Finnish art showcase',
      suggestedBy: 'Turku Events',
      createdAt: Date.now(),
      interestedCount: 0,
      notInterestedCount: 0,
      timeSlots: {
        morning: { votes: 0, specificTimes: {} },
        afternoon: { votes: 0, specificTimes: {} },
        evening: { votes: 0, specificTimes: {} },
        night: { votes: 0, specificTimes: {} },
      },
      source: 'turku-api',
      externalUrl: 'https://turkuartmuseum.fi',
      isExternal: true,
    },
    {
      id: 'turku-2',
      title: 'Market Square Food Festival',
      description: 'Local food vendors and live music',
      suggestedBy: 'Visit Turku',
      createdAt: Date.now(),
      interestedCount: 0,
      notInterestedCount: 0,
      timeSlots: {
        morning: { votes: 0, specificTimes: {} },
        afternoon: { votes: 0, specificTimes: {} },
        evening: { votes: 0, specificTimes: {} },
        night: { votes: 0, specificTimes: {} },
      },
      source: 'turku-api',
      externalUrl: 'https://visitturku.fi',
      isExternal: true,
    },
  ];

  return mockEvents;
};
