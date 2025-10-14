import { useState } from 'react';
import { Event } from '../types';
import { initializeSpecificTimes } from '../utils/timeUtils';

interface SuggestEventProps {
  onClose: () => void;
  onSubmit: (event: Event) => void;
  suggestedBy: string;
}

export default function SuggestEvent({ onClose, onSubmit, suggestedBy }: SuggestEventProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newEvent: Event = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      suggestedBy,
      createdAt: new Date().toISOString(),
      interestedCount: 0,
      notInterestedCount: 0,
      timeSlots: [
        { time: 'morning', votes: 0, specificTimes: initializeSpecificTimes('morning') },
        { time: 'afternoon', votes: 0, specificTimes: initializeSpecificTimes('afternoon') },
        { time: 'evening', votes: 0, specificTimes: initializeSpecificTimes('evening') },
        { time: 'night', votes: 0, specificTimes: initializeSpecificTimes('night') },
      ],
      source: 'user',
    };

    onSubmit(newEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in border border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-3xl">✨</span> Suggest an Event
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-3xl transition-colors hover:rotate-90 transform duration-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all shadow-sm"
              placeholder="e.g., Evening Sauna Session"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all shadow-sm resize-none"
              placeholder="Describe the activity..."
              required
            />
          </div>

          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="text-lg">👤</span>
              Suggested by: <span className="font-bold text-purple-600 dark:text-purple-400">{suggestedBy}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Submit Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
