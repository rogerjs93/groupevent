import Cookies from 'js-cookie';

export interface UserStats {
  eventsCreated: number;
  lastEventDate: number;
  monthlyCount: number;
  currentMonth: string;
}

const RATE_LIMIT_KEY = 'event_rate_limit';
const MAX_EVENTS_PER_MONTH = 10;

// Get current month identifier (YYYY-MM)
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Get user's rate limit stats
export function getUserStats(): UserStats {
  const stored = Cookies.get(RATE_LIMIT_KEY);
  const currentMonth = getCurrentMonth();
  
  if (!stored) {
    return {
      eventsCreated: 0,
      lastEventDate: 0,
      monthlyCount: 0,
      currentMonth,
    };
  }
  
  const stats: UserStats = JSON.parse(stored);
  
  // Reset monthly count if it's a new month
  if (stats.currentMonth !== currentMonth) {
    return {
      eventsCreated: stats.eventsCreated,
      lastEventDate: stats.lastEventDate,
      monthlyCount: 0,
      currentMonth,
    };
  }
  
  return stats;
}

// Check if user can create an event
export function canCreateEvent(): { allowed: boolean; remaining: number; reason?: string } {
  const stats = getUserStats();
  const remaining = MAX_EVENTS_PER_MONTH - stats.monthlyCount;
  
  if (stats.monthlyCount >= MAX_EVENTS_PER_MONTH) {
    return {
      allowed: false,
      remaining: 0,
      reason: `You've reached the limit of ${MAX_EVENTS_PER_MONTH} events per month. Resets on the 1st.`,
    };
  }
  
  // Optional: Add cooldown (e.g., 5 minutes between events)
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  const timeSinceLastEvent = Date.now() - stats.lastEventDate;
  
  if (stats.lastEventDate > 0 && timeSinceLastEvent < COOLDOWN_MS) {
    const minutesLeft = Math.ceil((COOLDOWN_MS - timeSinceLastEvent) / 60000);
    return {
      allowed: false,
      remaining,
      reason: `Please wait ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} before creating another event.`,
    };
  }
  
  return {
    allowed: true,
    remaining,
  };
}

// Record that user created an event
export function recordEventCreation(): void {
  const stats = getUserStats();
  
  const updatedStats: UserStats = {
    eventsCreated: stats.eventsCreated + 1,
    lastEventDate: Date.now(),
    monthlyCount: stats.monthlyCount + 1,
    currentMonth: stats.currentMonth,
  };
  
  // Store for 31 days
  Cookies.set(RATE_LIMIT_KEY, JSON.stringify(updatedStats), { expires: 31 });
}

// Get formatted reset date
export function getResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
