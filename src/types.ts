export interface TimeSlot {
  time: 'morning' | 'afternoon' | 'evening' | 'night';
  votes: number;
  specificTimes?: SpecificTime[];
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
  createdAt: string;
  interestedCount: number;
  notInterestedCount: number;
  timeSlots: TimeSlot[];
  source?: 'user' | 'turku-api';
  externalUrl?: string;
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
