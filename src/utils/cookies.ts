import Cookies from 'js-cookie';
import { VoteCookie } from '../types';

const COOKIE_NAME = 'event_votes';
const COOKIE_EXPIRES = 365; // days

export const getVotes = (): VoteCookie[] => {
  const cookieValue = Cookies.get(COOKIE_NAME);
  if (!cookieValue) return [];
  
  try {
    return JSON.parse(cookieValue);
  } catch {
    return [];
  }
};

export const hasVoted = (eventId: string): boolean => {
  const votes = getVotes();
  return votes.some(vote => vote.eventId === eventId);
};

export const addVote = (vote: VoteCookie): void => {
  const votes = getVotes();
  
  // Remove existing vote for this event if any
  const filteredVotes = votes.filter(v => v.eventId !== vote.eventId);
  
  // Add new vote
  filteredVotes.push(vote);
  
  Cookies.set(COOKIE_NAME, JSON.stringify(filteredVotes), { 
    expires: COOKIE_EXPIRES 
  });
};

export const getVoteForEvent = (eventId: string): VoteCookie | undefined => {
  const votes = getVotes();
  return votes.find(vote => vote.eventId === eventId);
};

export const removeVote = (eventId: string): void => {
  const votes = getVotes();
  const filteredVotes = votes.filter(v => v.eventId !== eventId);
  Cookies.set(COOKIE_NAME, JSON.stringify(filteredVotes), { 
    expires: COOKIE_EXPIRES 
  });
};
