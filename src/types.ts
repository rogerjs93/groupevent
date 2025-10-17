export interface TimeSlot {
  votes: number;
  specificTimes: { [time: string]: number };
}

export interface SpecificTime {
  time: string; // e.g., "18:00", "19:30"
  votes: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  suggestedBy: string;
  createdAt: number;
  interestedCount: number;
  notInterestedCount: number;
  timeSlots: {
    morning: TimeSlot;
    afternoon: TimeSlot;
    evening: TimeSlot;
    night: TimeSlot;
  };
  source?: string;
  externalUrl?: string;
  isExternal?: boolean;
  city?: string; // City where the event takes place
  eventDate?: number; // Timestamp of the event date
  suggestedTime?: string; // Creator's preferred time (e.g., "18:00")
  suggestedTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'night'; // Creator's preferred time slot
}

export interface User {
  username: string;
  createdAt: string;
}

export interface VoteCookie {
  eventId: string;
  interested: boolean;
  timeSlot?: string;
  specificTime?: string; // e.g., "18:00"
}
