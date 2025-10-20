import { useState, useEffect, useRef } from 'react';
import { Event, User } from './types';
import EventList from './components/EventList';
import SuggestEvent from './components/SuggestEvent';
import UsernameModal from './components/UsernameModal';
import UserStatsModal from './components/UserStatsModal';
import ToastContainer from './components/ToastContainer';
import SkeletonCard from './components/SkeletonCard';
import { useToast } from './contexts/ToastContext';
import { fetchEvents, fetchUsers, addEvent, updateEvent, deleteEvent, addUser } from './utils/api';
import { fetchTurkuActivities, startEventSync } from './utils/turkuEventsStream';
import { applyStoredVotesToExternalEvents, saveExternalEventVotes } from './utils/externalEventStorage';
import { canCreateEvent, recordEventCreation } from './utils/rateLimiting';

type FilterType = 'all' | 'week' | 'month' | 'interested' | 'myEvents';
type SortType = 'date' | 'popularity' | 'newest';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [externalEvents, setExternalEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { showToast } = useToast();

  // Use useRef to track interaction state without causing re-renders
  const isUserInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout>();

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    loadData();
    
    // Check if user has a username in localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setCurrentUsername(savedUsername);
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 Page visible - resuming polls');
      } else {
        console.log('🌙 Page hidden - pausing polls');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start syncing events every 6 hours
    const turkuCleanup = startEventSync((turkuEvents) => {
      // Apply stored votes to external events before setting state
      const eventsWithVotes = applyStoredVotesToExternalEvents(turkuEvents);
      setExternalEvents(eventsWithVotes);
    });

    // Poll for event updates every 5 minutes
    // Only poll when user is not actively interacting AND page is visible
    const pollInterval = setInterval(() => {
      // Use ref instead of state to check interaction without triggering re-renders
      if (!isUserInteractingRef.current && !document.hidden) {
        console.log('🔄 Polling for event updates...');
        Promise.all([
          fetchEvents(),
          fetchTurkuActivities()
        ]).then(([eventsData, turkuEvents]) => {
          setEvents(eventsData);
          // Apply stored votes to external events
          setExternalEvents(applyStoredVotesToExternalEvents(turkuEvents));
          console.log('✅ Events updated');
        }).catch((error) => {
          console.error('Error polling events:', error);
        });
      } else {
        if (document.hidden) {
          console.log('⏸️ Skipping poll - page not visible');
        } else {
          console.log('⏸️ Skipping poll - user is interacting');
        }
      }
    }, 5 * 60 * 1000); // Poll every 5 minutes

    // Detect user interaction to pause polling
    const handleUserInteraction = () => {
      isUserInteractingRef.current = true;
      clearTimeout(interactionTimeoutRef.current);
      // Resume polling after 10 seconds of no interaction
      interactionTimeoutRef.current = setTimeout(() => {
        isUserInteractingRef.current = false;
        console.log('✅ Polling resumed');
      }, 10000);
    };

    // Listen for mouse and touch events
    window.addEventListener('mousedown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    return () => {
      turkuCleanup(); // Cleanup Turku events interval
      clearInterval(pollInterval); // Cleanup polling interval
      clearTimeout(interactionTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousedown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []); // Empty dependency array - runs only once on mount

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, usersData, turkuEvents] = await Promise.all([
        fetchEvents(),
        fetchUsers(),
        fetchTurkuActivities(),
      ]);
      
      setEvents(eventsData);
      // Apply stored votes to external events
      setExternalEvents(applyStoredVotesToExternalEvents(turkuEvents));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = () => {
    const rateCheck = canCreateEvent();
    
    if (!rateCheck.allowed) {
      showToast(rateCheck.reason || 'Rate limit exceeded', 'warning', 5000);
      setShowStatsModal(true);
      return;
    }
    
    setShowSuggestModal(true);
  };

  const handleAddEvent = async (event: Event) => {
    const rateCheck = canCreateEvent();
    
    if (!rateCheck.allowed) {
      showToast(rateCheck.reason || 'Rate limit exceeded', 'warning', 5000);
      setShowStatsModal(true);
      return;
    }

    try {
      await addEvent(event);
      setEvents([...events, event]);
      recordEventCreation();
      setShowSuggestModal(false);
      showToast(`Event "${event.title}" created successfully! 🎉`, 'success');
    } catch (error) {
      console.error('Error adding event:', error);
      showToast('Failed to add event. Please try again.', 'error');
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      // Handle external events differently - store votes in localStorage
      if (updatedEvent.isExternal) {
        saveExternalEventVotes(updatedEvent.id, updatedEvent);
        setExternalEvents(prev =>
          prev.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
        );
        return;
      }

      // Update on server first (no optimistic update to avoid conflicts)
      await updateEvent(updatedEvent);
      
      // Immediately fetch fresh data after successful update
      const freshEvents = await fetchEvents();
      setEvents(freshEvents);
      
    } catch (error) {
      console.error('Error updating event:', error);
      showToast('Failed to update event. Please try again.', 'error');
      // Fetch fresh data on error to ensure consistency
      try {
        const freshEvents = await fetchEvents();
        setEvents(freshEvents);
      } catch (fetchError) {
        console.error('Error fetching fresh data:', fetchError);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Store reference to the deleted event for undo functionality
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      
      // Show toast with undo option
      showToast(
        `Event "${eventToDelete.title}" deleted`,
        'info',
        5000,
        {
          label: 'Undo',
          onClick: async () => {
            try {
              await addEvent(eventToDelete);
              setEvents(prev => [...prev, eventToDelete]);
              showToast('Event restored!', 'success');
            } catch (error) {
              showToast('Failed to restore event', 'error');
            }
          }
        }
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Failed to delete event. Please try again.', 'error');
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

  // Filter events based on selected filter
  const filterEvents = (eventsList: Event[]) => {
    const now = Date.now();
    const oneWeek = now + (7 * 24 * 60 * 60 * 1000);
    const oneMonth = now + (30 * 24 * 60 * 60 * 1000);

    switch (filterType) {
      case 'week':
        return eventsList.filter(e => e.eventDate && e.eventDate >= now && e.eventDate <= oneWeek);
      case 'month':
        return eventsList.filter(e => e.eventDate && e.eventDate >= now && e.eventDate <= oneMonth);
      case 'interested':
        return eventsList.filter(e => e.interestedCount > 0);
      case 'myEvents':
        return eventsList.filter(e => e.suggestedBy === currentUsername);
      default:
        return eventsList;
    }
  };

  // Sort events based on selected sort type
  const sortEvents = (eventsList: Event[]) => {
    const sorted = [...eventsList];
    
    switch (sortType) {
      case 'date':
        return sorted.sort((a, b) => (a.eventDate || Infinity) - (b.eventDate || Infinity));
      case 'popularity':
        return sorted.sort((a, b) => b.interestedCount - a.interestedCount);
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      default:
        return sorted;
    }
  };

  const getFilteredAndSortedEvents = () => {
    const allEvents = [...events];
    const filtered = filterEvents(allEvents);
    return sortEvents(filtered);
  };

  const getFilteredExternalEvents = () => {
    return filterEvents([...externalEvents]);
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
      showToast(`Welcome, ${username}! 👋`, 'success');
    } catch (error) {
      console.error('Error setting username:', error);
      showToast('Failed to set username. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-violet-300 dark:bg-violet-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 dark:bg-slate-900/80 shadow-xl border-b border-white/20 dark:border-slate-700/50 transition-colors duration-300">
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
                Finland · {externalEvents.length} Live Events
              </p>
            </div>
            <div className="flex gap-3 animate-fade-in">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-200 dark:border-purple-700"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
              </button>
              
              {/* Stats Button */}
              <button
                onClick={() => setShowStatsModal(true)}
                className="px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-200 dark:border-purple-700"
                title="View your event creation stats"
              >
                <span className="text-lg">📊</span>
              </button>
              
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
                onClick={handleSuggestClick}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 font-semibold"
              >
                <span className="text-lg">+</span> Suggest Event
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter and Sort Controls */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200 dark:border-purple-700 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Buttons */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter Events</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: '🌐 All Events', count: events.length + externalEvents.length },
                  { value: 'week', label: '📅 This Week', count: filterEvents([...events, ...externalEvents]).filter(e => {
                    const oneWeek = Date.now() + (7 * 24 * 60 * 60 * 1000);
                    return e.eventDate && e.eventDate >= Date.now() && e.eventDate <= oneWeek;
                  }).length },
                  { value: 'month', label: '📆 This Month', count: filterEvents([...events, ...externalEvents]).filter(e => {
                    const oneMonth = Date.now() + (30 * 24 * 60 * 60 * 1000);
                    return e.eventDate && e.eventDate >= Date.now() && e.eventDate <= oneMonth;
                  }).length },
                  { value: 'interested', label: '❤️ Interested', count: [...events, ...externalEvents].filter(e => e.interestedCount > 0).length },
                  { value: 'myEvents', label: '👤 My Events', count: events.filter(e => e.suggestedBy === currentUsername).length }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterType(filter.value as FilterType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                      filterType === filter.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-2 text-xs opacity-75">({filter.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Buttons */}
            <div className="md:border-l md:pl-6 border-gray-200 dark:border-slate-600">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sort By</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'date', label: '📅 Date', icon: '📅' },
                  { value: 'popularity', label: '🔥 Popularity', icon: '🔥' },
                  { value: 'newest', label: '✨ Newest', icon: '✨' }
                ].map(sort => (
                  <button
                    key={sort.value}
                    onClick={() => setSortType(sort.value as SortType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                      sortType === sort.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Loading Events...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* External Events from Turku */}
            {(() => {
              const filteredExternalEvents = getFilteredExternalEvents();
              return filteredExternalEvents.length > 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🌟 Happening in Turku
                  </h2>
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
                    <span className="text-xs font-medium text-blue-300">{filteredExternalEvents.length} events</span>
                  </div>
                </div>
                <EventList 
                  events={filteredExternalEvents} 
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                  currentUsername={currentUsername}
                />
              </div>
            );
            })()}

            {/* User Suggested Events - Categorized */}
            <div className="space-y-10 animate-fade-in animation-delay-200">
              {(() => {
                const filteredAndSortedEvents = getFilteredAndSortedEvents();
                const { upcoming, happeningSoon, past, noDate } = categorizeEvents(filteredAndSortedEvents);
                
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

      {showStatsModal && (
        <UserStatsModal
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
