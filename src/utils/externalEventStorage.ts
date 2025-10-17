import { Event } from '../types';

const EXTERNAL_VOTES_KEY = 'external_event_votes';

interface ExternalEventVotes {
  [eventId: string]: {
    interestedCount: number;
    notInterestedCount: number;
    timeSlots: {
      morning: { votes: number; specificTimes: { [time: string]: number } };
      afternoon: { votes: number; specificTimes: { [time: string]: number } };
      evening: { votes: number; specificTimes: { [time: string]: number } };
      night: { votes: number; specificTimes: { [time: string]: number } };
    };
  };
}

// Get stored votes for external events
export function getExternalEventVotes(): ExternalEventVotes {
  try {
    const stored = localStorage.getItem(EXTERNAL_VOTES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading external event votes:', error);
    return {};
  }
}

// Save votes for an external event
export function saveExternalEventVotes(eventId: string, event: Event): void {
  try {
    const allVotes = getExternalEventVotes();
    allVotes[eventId] = {
      interestedCount: event.interestedCount,
      notInterestedCount: event.notInterestedCount,
      timeSlots: event.timeSlots,
    };
    localStorage.setItem(EXTERNAL_VOTES_KEY, JSON.stringify(allVotes));
  } catch (error) {
    console.error('Error saving external event votes:', error);
  }
}

// Apply stored votes to external events
export function applyStoredVotesToExternalEvents(events: Event[]): Event[] {
  const storedVotes = getExternalEventVotes();
  
  return events.map(event => {
    if (event.isExternal && storedVotes[event.id]) {
      return {
        ...event,
        interestedCount: storedVotes[event.id].interestedCount,
        notInterestedCount: storedVotes[event.id].notInterestedCount,
        timeSlots: storedVotes[event.id].timeSlots,
      };
    }
    return event;
  });
}
