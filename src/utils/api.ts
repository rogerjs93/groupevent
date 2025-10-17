import { Event, User } from '../types';

// API endpoint - will be your Vercel deployment URL
// For local development, it uses Vercel dev server
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const EVENTS_ENDPOINT = `${API_BASE}/events`;
const USERS_ENDPOINT = `${API_BASE}/users`;

// Helper to make API requests
const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Events API
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    // Add cache busting to ensure fresh data
    const cacheBuster = `?_t=${Date.now()}`;
    return await apiRequest(`${EVENTS_ENDPOINT}${cacheBuster}`);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const addEvent = async (event: Event): Promise<void> => {
  await apiRequest(EVENTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(event),
  });
};

export const updateEvent = async (updatedEvent: Event): Promise<void> => {
  await apiRequest(EVENTS_ENDPOINT, {
    method: 'PUT',
    body: JSON.stringify(updatedEvent),
  });
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await apiRequest(EVENTS_ENDPOINT, {
    method: 'DELETE',
    body: JSON.stringify({ eventId }),
  });
};

// Users API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    return await apiRequest(USERS_ENDPOINT);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (user: User): Promise<void> => {
  await apiRequest(USERS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(user),
  });
};
