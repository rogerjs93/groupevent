import { Event } from '../types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onUpdateEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  currentUsername: string;
}

export default function EventList({ events, onUpdateEvent, onDeleteEvent, currentUsername }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="inline-block p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800 hover-lift">
          <div className="text-8xl mb-6 animate-bounce-subtle">📅</div>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            No events found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Be the first to suggest an amazing activity! ✨
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <span className="text-2xl">🎉</span>
              <span>Create fun events</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <span className="text-2xl">👥</span>
              <span>Gather your friends</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <span className="text-2xl">🗓️</span>
              <span>Pick perfect times</span>
            </div>
          </div>
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
            onDelete={onDeleteEvent}
            currentUsername={currentUsername}
          />
        </div>
      ))}
    </div>
  );
}
