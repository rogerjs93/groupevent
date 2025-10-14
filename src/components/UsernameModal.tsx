import { useState, useEffect } from 'react';
import { User } from '../types';

interface UsernameModalProps {
  onClose: () => void;
  onSubmit: (username: string) => void;
  existingUsers: User[];
}

// Fun neuroscience-themed username generator
const generateNeuroscienceUsername = (existingUsers: User[]): string => {
  const adjectives = [
    'Synaptic', 'Neural', 'Cortical', 'Cerebral', 'Axonal',
    'Dendritic', 'Cognitive', 'Neuronal', 'Hippocampal', 'Prefrontal',
    'Dopamine', 'Serotonin', 'Limbic', 'Thalamic', 'Cerebellar',
    'Myelin', 'Plasticity', 'Neurogenic', 'Excitatory', 'Inhibitory',
    'Quantum', 'Spike', 'Membrane', 'Vesicle', 'Receptor',
    'Glial', 'Astrocyte', 'Neurite', 'Somatic', 'Oscillatory'
  ];

  const nouns = [
    'Neuron', 'Synapse', 'Dendrite', 'Axon', 'Brain',
    'Cortex', 'Ganglion', 'Nucleus', 'Pathway', 'Circuit',
    'Signal', 'Impulse', 'Potential', 'Wave', 'Spike',
    'Network', 'Module', 'Hub', 'Node', 'Cluster',
    'Processor', 'Encoder', 'Decoder', 'Analyzer', 'Scanner',
    'Mapper', 'Connector', 'Transmitter', 'Channel', 'Receptor'
  ];

  const suffixes = [
    '42', '101', '404', '99', '007',
    'X', 'Prime', 'Neo', 'Alpha', 'Beta',
    'Gamma', 'Delta', 'Theta', 'Omega', 'Sigma'
  ];

  let attempts = 0;
  let username = '';

  // Try up to 100 times to generate a unique username
  while (attempts < 100) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
    
    username = `${adj}${noun}${suffix}`;

    // Check if username is unique
    if (!existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      break;
    }
    attempts++;
  }

  // If we couldn't find a unique one after 100 attempts, append timestamp
  if (attempts >= 100) {
    username = `Neural${Date.now().toString().slice(-6)}`;
  }

  return username;
};

export default function UsernameModal({ onClose, onSubmit, existingUsers }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Generate initial random username on mount
  useEffect(() => {
    const randomUsername = generateNeuroscienceUsername(existingUsers);
    setUsername(randomUsername);
  }, [existingUsers]);

  const handleRandomize = () => {
    setIsRandomizing(true);
    setError('');
    
    // Add a fun animation delay
    setTimeout(() => {
      const randomUsername = generateNeuroscienceUsername(existingUsers);
      setUsername(randomUsername);
      setIsRandomizing(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Username cannot be empty');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (trimmedUsername.length > 30) {
      setError('Username must be less than 30 characters');
      return;
    }

    // Check if username contains only valid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    // Check if username already exists (case-insensitive)
    if (existingUsers.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      setError('⚠️ This username is already taken. Try another or click randomize!');
      return;
    }

    onSubmit(trimmedUsername);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in border border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-3xl">🧠</span> Choose a Username
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-3xl transition-colors hover:rotate-90 transform duration-200"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <span className="font-semibold text-purple-600 dark:text-purple-400">🔬 Neuroscience-powered!</span> Your unique identifier will be stored in the repository and displayed with your event suggestions.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <span>Username</span>
              <button
                type="button"
                onClick={handleRandomize}
                disabled={isRandomizing}
                className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className={isRandomizing ? 'animate-spin' : ''}>🎲</span>
                {isRandomizing ? 'Generating...' : 'Randomize'}
              </button>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all shadow-sm ${
                  error 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-purple-200 dark:border-purple-700'
                }`}
                placeholder="Enter username"
                required
                autoFocus
                maxLength={30}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {username.length}/30
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-2 animate-slide-up bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">
                <span>⚠️</span> {error}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
              <span>💡</span> Tip: Click "Randomize" for a fun neuroscience-themed username!
            </p>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
              <span className="text-lg">🔒</span>
              <div>
                <p className="font-semibold">Unique & Permanent</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Once registered, this username cannot be used by anyone else. Choose wisely!
                </p>
              </div>
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
              Claim Username ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
