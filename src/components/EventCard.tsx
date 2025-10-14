import { useState } from 'react';
import { Event, TimeSlot, SpecificTime } from '../types';
import { hasVoted, addVote, getVoteForEvent } from '../utils/cookies';
import { initializeSpecificTimes, formatTime } from '../utils/timeUtils';

interface EventCardProps {
  event: Event;
  onUpdate: (event: Event) => void;
  currentUsername: string;
}

export default function EventCard({ event, onUpdate }: EventCardProps) {
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showSpecificTimes, setShowSpecificTimes] = useState(false);
  const voted = hasVoted(event.id);
  const existingVote = getVoteForEvent(event.id);

  const handleVote = (interested: boolean, timeSlot?: TimeSlot) => {
    if (voted && !timeSlot) {
      alert('You have already voted on this event!');
      return;
    }

    if (!interested) {
      // Handle "not interested" vote
      const updatedEvent = { ...event };
      if (!existingVote) {
        updatedEvent.notInterestedCount += 1;
      }
      
      addVote({
        eventId: event.id,
        interested: false,
      });
      
      onUpdate(updatedEvent);
      return;
    }

    if (interested && !timeSlot) {
      // First step: show time slots
      const updatedEvent = { ...event };
      if (!existingVote) {
        updatedEvent.interestedCount += 1;
      }
      
      addVote({
        eventId: event.id,
        interested: true,
      });
      
      onUpdate(updatedEvent);
      setShowTimeSlots(true);
      return;
    }

    if (interested && timeSlot) {
      // Second step: user selected a time slot, now show specific times
      setSelectedTimeSlot(timeSlot);
      
      // Initialize specific times if not already present
      if (!timeSlot.specificTimes || timeSlot.specificTimes.length === 0) {
        const updatedEvent = { ...event };
        updatedEvent.timeSlots = updatedEvent.timeSlots.map(slot => {
          if (slot.time === timeSlot.time) {
            return {
              ...slot,
              specificTimes: initializeSpecificTimes(slot.time),
              votes: slot.votes + 1,
            };
          }
          return slot;
        });
        onUpdate(updatedEvent);
      } else {
        // Just update the vote count for the time slot
        const updatedEvent = { ...event };
        updatedEvent.timeSlots = updatedEvent.timeSlots.map(slot =>
          slot.time === timeSlot.time
            ? { ...slot, votes: slot.votes + 1 }
            : slot
        );
        onUpdate(updatedEvent);
      }
      
      setShowSpecificTimes(true);
    }
  };

  const handleSpecificTimeVote = (specificTime: SpecificTime) => {
    if (existingVote?.specificTime) {
      alert('You have already selected a specific time!');
      return;
    }

    const updatedEvent = { ...event };
    
    // Update the specific time vote
    updatedEvent.timeSlots = updatedEvent.timeSlots.map(slot => {
      if (slot.time === selectedTimeSlot?.time && slot.specificTimes) {
        return {
          ...slot,
          specificTimes: slot.specificTimes.map(st =>
            st.time === specificTime.time
              ? { ...st, votes: st.votes + 1 }
              : st
          ),
        };
      }
      return slot;
    });

    // Save the complete vote
    addVote({
      eventId: event.id,
      interested: true,
      timeSlot: selectedTimeSlot?.time,
      specificTime: specificTime.time,
    });

    onUpdate(updatedEvent);
    setShowSpecificTimes(false);
  };

  const totalVotes = event.interestedCount + event.notInterestedCount;
  const interestPercentage = totalVotes > 0 
    ? Math.round((event.interestedCount / totalVotes) * 100) 
    : 0;

  const timeLabels: Record<string, string> = {
    morning: '🌅 Morning',
    afternoon: '☀️ Afternoon',
    evening: '🌆 Evening',
    night: '🌙 Night',
  };

  return (
    <div className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700 transform hover:-translate-y-1 animate-scale-in">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
      
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {event.title}
          </h3>
          {event.source === 'turku-api' && (
            <span className="ml-2 px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-md font-medium">
              ✨ Turku
            </span>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
          {event.description}
        </p>

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span className="text-purple-500">👤</span> 
            Suggested by: <span className="font-semibold text-gray-700 dark:text-gray-300">{event.suggestedBy}</span>
          </span>
        </div>

        {event.externalUrl && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            Learn more <span className="text-xs">→</span>
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Interest Level</span>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {interestPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
            style={{ width: `${interestPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200px 100%',
            }}></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <span className="text-green-500">👍</span> 
            <span className="font-semibold text-green-600 dark:text-green-400">{event.interestedCount}</span> interested
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-500">👎</span> 
            <span className="font-semibold text-red-600 dark:text-red-400">{event.notInterestedCount}</span> not interested
          </span>
        </div>
      </div>

      {/* Voting Buttons */}
      {!voted && (
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={() => handleVote(true)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-lg">✓</span> Interested
            </button>
            <button
              onClick={() => handleVote(false)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-lg">✗</span> Not Interested
            </button>
          </div>
        </div>
      )}

      {/* Time Slots */}
      {(showTimeSlots || (voted && existingVote?.interested && !existingVote?.timeSlot)) && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900/50 dark:to-purple-900/30 px-6 py-5 border-t border-purple-100 dark:border-purple-900/50 animate-slide-up">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-lg">🕐</span> Preferred Time Slot:
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {event.timeSlots.map(slot => (
              <button
                key={slot.time}
                onClick={() => !existingVote?.timeSlot && handleVote(true, slot)}
                disabled={!!existingVote?.timeSlot}
                className={`px-4 py-3 text-sm rounded-xl transition-all duration-200 font-semibold shadow-md ${
                  existingVote?.timeSlot === slot.time
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:shadow-lg transform hover:scale-105'
                } ${existingVote?.timeSlot ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{timeLabels[slot.time]}</span>
                  <div className="text-xs opacity-80 flex items-center gap-1">
                    <span>📊</span> {slot.votes} votes
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Specific Time Selection */}
      {showSpecificTimes && selectedTimeSlot && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900/50 dark:to-violet-900/30 px-6 py-5 border-t border-violet-100 dark:border-violet-900/50 animate-slide-up">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-lg">⏰</span> Select Specific Time ({timeLabels[selectedTimeSlot.time]}):
          </h4>
          <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {selectedTimeSlot.specificTimes?.map(specificTime => (
              <button
                key={specificTime.time}
                onClick={() => handleSpecificTimeVote(specificTime)}
                className="px-3 py-2.5 text-sm rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              >
                <div className="font-bold">{formatTime(specificTime.time)}</div>
                <div className="text-xs opacity-75 mt-0.5">{specificTime.votes} 📊</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show selected time slot and specific time */}
      {voted && existingVote?.interested && existingVote?.timeSlot && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900/50 dark:to-green-900/30 px-6 py-5 border-t border-green-100 dark:border-green-900/50">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-lg">✅</span> Your Vote:
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm bg-white dark:bg-slate-800 rounded-lg p-3 shadow-md">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Time Slot:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {timeLabels[existingVote.timeSlot as keyof typeof timeLabels]}
              </span>
            </div>
            {existingVote.specificTime && (
              <div className="flex items-center gap-3 text-sm bg-white dark:bg-slate-800 rounded-lg p-3 shadow-md">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Specific Time:</span>
                <span className="font-bold text-pink-600 dark:text-pink-400">
                  {formatTime(existingVote.specificTime)}
                </span>
              </div>
            )}
          </div>

          {/* Show popular times for this slot */}
          {existingVote.timeSlot && (() => {
            const slot = event.timeSlots.find(s => s.time === existingVote.timeSlot);
            const topTimes = slot?.specificTimes
              ?.filter(st => st.votes > 0)
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 3);
            
            return topTimes && topTimes.length > 0 ? (
              <div className="mt-4">
                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <span>🌟</span> Most Popular Times:
                </h5>
                <div className="flex gap-2 flex-wrap">
                  {topTimes.map((st, index) => (
                    <div
                      key={st.time}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold shadow-md ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
                          : 'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {index === 0 && <span>🥇</span>}
                        {index === 1 && <span>🥈</span>}
                        {index === 2 && <span>🥉</span>}
                        <span>{formatTime(st.time)}</span>
                        <span className="opacity-80">({st.votes})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {voted && (
        <div className="px-6 py-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
            <span className="text-lg">✓</span> You've voted on this event
          </span>
        </div>
      )}
    </div>
  );
}
