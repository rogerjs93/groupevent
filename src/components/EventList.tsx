import { Event } from '../types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onUpdateEvent: (event: Event) => void;
  currentUsername: string;
}

export default function EventList({ events, onUpdateEvent, currentUsername }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-block p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800">
          <div className="text-7xl mb-6 animate-bounce-subtle">📅</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            No events yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Be the first to suggest an amazing activity! ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <div
          key={event.id}
          style={{ animationDelay: `${index * 0.1}s` }}
          className="animate-slide-up"
        >
          <EventCard
            event={event}
            onUpdate={onUpdateEvent}
            currentUsername={currentUsername}
          />
        </div>
      ))}
    </div>
  );
}
