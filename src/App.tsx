import { useState, useEffect } from 'react';
import { Event, User } from './types';
import EventList from './components/EventList';
import SuggestEvent from './components/SuggestEvent';
import UsernameModal from './components/UsernameModal';
import { fetchEvents, fetchUsers, addEvent, updateEvent, deleteEvent, addUser } from './utils/api';
import { fetchTurkuActivities, startEventSync } from './utils/turkuEventsStream';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [externalEvents, setExternalEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check if user has a username in localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setCurrentUsername(savedUsername);
    }

    // Start syncing Turku events every 6 hours
    const turkuCleanup = startEventSync((turkuEvents) => {
      setExternalEvents(turkuEvents);
    });

    // Poll for event updates every 5 seconds to show votes and new events
    const pollInterval = setInterval(() => {
      Promise.all([
        fetchEvents(),
        fetchTurkuActivities()
      ]).then(([eventsData, turkuEvents]) => {
        setEvents(eventsData);
        setExternalEvents(turkuEvents);
      }).catch((error) => {
        console.error('Error polling events:', error);
      });
    }, 5000); // Poll every 5 seconds for better real-time updates

    return () => {
      turkuCleanup(); // Cleanup Turku events interval
      clearInterval(pollInterval); // Cleanup polling interval
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, usersData, turkuEvents] = await Promise.all([
        fetchEvents(),
        fetchUsers(),
        fetchTurkuActivities(),
      ]);
      
      setEvents(eventsData);
      setExternalEvents(turkuEvents);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (event: Event) => {
    try {
      await addEvent(event);
      setEvents([...events, event]);
      setShowSuggestModal(false);
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      // Don't update external events in repo
      if (updatedEvent.isExternal) {
        setExternalEvents(prev =>
          prev.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
        );
        return;
      }

      // Optimistically update the UI
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      
      // Then update on server
      await updateEvent(updatedEvent);
      
      // Fetch fresh data to ensure consistency
      const freshEvents = await fetchEvents();
      setEvents(freshEvents);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
      // Revert to fresh data on error
      const freshEvents = await fetchEvents();
      setEvents(freshEvents);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  // Categorize events based on their date
  const categorizeEvents = (eventsList: Event[]) => {
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    
    const upcoming: Event[] = [];
    const happeningSoon: Event[] = [];
    const past: Event[] = [];
    const noDate: Event[] = [];

    eventsList.forEach(event => {
      if (!event.eventDate) {
        noDate.push(event);
        return;
      }

      if (event.eventDate < now) {
        past.push(event);
      } else if (event.eventDate <= sevenDaysFromNow) {
        happeningSoon.push(event);
      } else {
        upcoming.push(event);
      }
    });

    // Sort each category
    happeningSoon.sort((a, b) => (a.eventDate || 0) - (b.eventDate || 0)); // Soonest first
    upcoming.sort((a, b) => (a.eventDate || 0) - (b.eventDate || 0)); // Soonest first
    past.sort((a, b) => (b.eventDate || 0) - (a.eventDate || 0)); // Most recent first
    noDate.sort((a, b) => b.createdAt - a.createdAt); // Newest first

    return { upcoming, happeningSoon, past, noDate };
  };

  const handleSetUsername = async (username: string) => {
    const newUser: User = {
      username,
      createdAt: new Date().toISOString(),
    };
    
    try {
      await addUser(newUser);
      setUsers([...users, newUser]);
      setCurrentUsername(username);
      localStorage.setItem('username', username);
      setShowUsernameModal(false);
    } catch (error) {
      console.error('Error setting username:', error);
      alert('Failed to set username. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-violet-300 dark:bg-violet-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 dark:bg-slate-900/80 shadow-xl border-b border-white/20 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <span className="text-3xl">🎉</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Event Organizer
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-14 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Turku, Finland · {externalEvents.length} Live Events
              </p>
            </div>
            <div className="flex gap-3 animate-fade-in">
              {currentUsername ? (
                <div className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <span className="text-lg">👤</span> {currentUsername}
                </div>
              ) : (
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className="px-5 py-2.5 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-200 dark:border-purple-700"
                >
                  <span className="text-lg">✨</span> Set Username
                </button>
              )}
              <button
                onClick={() => setShowSuggestModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 font-semibold"
              >
                <span className="text-lg">+</span> Suggest Event
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-white dark:text-gray-300 font-medium">Loading amazing events...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* External Events from Turku */}
            {externalEvents.length > 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🌟 Happening in Turku
                  </h2>
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
                    <span className="text-xs font-medium text-blue-300">{externalEvents.length} events</span>
                  </div>
                </div>
                <EventList 
                  events={externalEvents} 
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                  currentUsername={currentUsername}
                />
              </div>
            )}

            {/* User Suggested Events - Categorized */}
            <div className="space-y-10 animate-fade-in animation-delay-200">
              {(() => {
                const { upcoming, happeningSoon, past, noDate } = categorizeEvents(events);
                
                return (
                  <>
                    {/* Happening Soon Section */}
                    {happeningSoon.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            🔥 Happening Soon
                          </h2>
                          <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-xs font-medium text-orange-300">{happeningSoon.length} events</span>
                          </div>
                        </div>
                        <EventList 
                          events={happeningSoon} 
                          onUpdateEvent={handleUpdateEvent}
                          onDeleteEvent={handleDeleteEvent}
                          currentUsername={currentUsername}
                        />
                      </div>
                    )}

                    {/* Upcoming Events Section */}
                    {upcoming.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            📅 Upcoming Events
                          </h2>
                          <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-xs font-medium text-cyan-300">{upcoming.length} events</span>
                          </div>
                        </div>
                        <EventList 
                          events={upcoming} 
                          onUpdateEvent={handleUpdateEvent}
                          onDeleteEvent={handleDeleteEvent}
                          currentUsername={currentUsername}
                        />
                      </div>
                    )}

                    {/* No Date Events Section */}
                    {noDate.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            � Community Ideas
                          </h2>
                          <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-xs font-medium text-purple-300">{noDate.length} events</span>
                          </div>
                        </div>
                        <EventList 
                          events={noDate} 
                          onUpdateEvent={handleUpdateEvent}
                          onDeleteEvent={handleDeleteEvent}
                          currentUsername={currentUsername}
                        />
                      </div>
                    )}

                    {/* Past Events Section - Collapsible */}
                    {past.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowPastEvents(!showPastEvents)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent">
                              📦 Past Events
                            </h2>
                            <div className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full backdrop-blur-sm">
                              <span className="text-xs font-medium text-gray-300">{past.length} events</span>
                            </div>
                            <span className="text-gray-400 text-xl">
                              {showPastEvents ? '▼' : '▶'}
                            </span>
                          </button>
                        </div>
                        {showPastEvents && (
                          <div className="opacity-70 hover:opacity-100 transition-opacity">
                            <EventList 
                              events={past} 
                              onUpdateEvent={handleUpdateEvent}
                              onDeleteEvent={handleDeleteEvent}
                              currentUsername={currentUsername}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty State */}
                    {events.length === 0 && (
                      <div className="text-center py-16 animate-fade-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-white dark:text-gray-300 mb-2">
                          No community events yet
                        </h3>
                        <p className="text-gray-400 dark:text-gray-500">
                          Be the first to suggest an event!
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showSuggestModal && (
        <SuggestEvent
          onClose={() => setShowSuggestModal(false)}
          onSubmit={handleAddEvent}
          suggestedBy={currentUsername || 'Anonymous'}
        />
      )}

      {showUsernameModal && (
        <UsernameModal
          onClose={() => setShowUsernameModal(false)}
          onSubmit={handleSetUsername}
          existingUsers={users}
        />
      )}
    </div>
  );
}

export default App;
