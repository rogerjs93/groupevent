import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Event } from '../types';

interface SuggestEventProps {
  onClose: () => void;
  onSubmit: (event: Event) => void;
  suggestedBy: string;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function SuggestEvent({ onClose, onSubmit, suggestedBy }: SuggestEventProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [suggestedTimeSlot, setSuggestedTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [suggestedTime, setSuggestedTime] = useState('18:00');
  const [step, setStep] = useState<'details' | 'datetime'>('details');

  const timeSlotRanges = {
    morning: '6:00 - 12:00',
    afternoon: '12:00 - 18:00',
    evening: '18:00 - 00:00',
    night: '00:00 - 6:00',
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const eventDateTimestamp = selectedDate instanceof Date 
      ? selectedDate.getTime() 
      : Date.now();

    const newEvent: Event = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      suggestedBy,
      createdAt: Date.now(),
      interestedCount: 0,
      notInterestedCount: 0,
      timeSlots: {
        morning: { votes: 0, specificTimes: {} },
        afternoon: { votes: 0, specificTimes: {} },
        evening: { votes: 0, specificTimes: {} },
        night: { votes: 0, specificTimes: {} },
      },
      eventDate: eventDateTimestamp,
      suggestedTime: suggestedTime,
      suggestedTimeSlot: suggestedTimeSlot,
    };

    onSubmit(newEvent);
  };

  const handleNext = () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in event title and description');
      return;
    }
    setStep('datetime');
  };

  const handleBack = () => {
    setStep('details');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-purple-200 dark:border-purple-800">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-purple-200 dark:border-purple-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-3xl">✨</span> Suggest an Event
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Step {step === 'details' ? '1' : '2'} of 2: {step === 'details' ? 'Event Details' : 'Date & Time'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-3xl transition-colors hover:rotate-90 transform duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 'details' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span>📝</span> Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Coffee Meetup at Market Square"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/100 characters</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span>📄</span> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell people what this event is about..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description.length}/500 characters</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Next: Date & Time →
                </button>
              </div>
            </div>
          )}

          {step === 'datetime' && (
            <div className="space-y-6 animate-fade-in">
              {/* Calendar Section */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span>📅</span> Event Date
                </label>
                <div className="calendar-container rounded-xl overflow-hidden border border-purple-200 dark:border-purple-700">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    className="w-full"
                  />
                </div>
                {selectedDate instanceof Date && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium">
                    Selected: {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span>🌅</span> Preferred Time of Day
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(timeSlotRanges) as Array<keyof typeof timeSlotRanges>).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSuggestedTimeSlot(slot)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        suggestedTimeSlot === slot
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                          : 'border-gray-300 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white capitalize">{slot}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeSlotRanges[slot]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Time Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span>⏰</span> Suggested Start Time (Optional)
                </label>
                <select
                  value={suggestedTime}
                  onChange={(e) => setSuggestedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This is your preference - others can vote for different times
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-200 font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Create Event ✨
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
