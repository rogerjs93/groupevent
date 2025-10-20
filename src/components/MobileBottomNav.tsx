interface MobileBottomNavProps {
  onSuggest: () => void;
  onStats: () => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
  username: string | null;
  onSetUsername: () => void;
}

export default function MobileBottomNav({
  onSuggest,
  onStats,
  onToggleDarkMode,
  darkMode,
  username,
  onSetUsername
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-purple-200 dark:border-purple-800 shadow-2xl">
        <div className="flex items-center justify-around px-4 py-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors active:scale-95"
          >
            <span className="text-2xl">{darkMode ? '☀️' : '🌙'}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Theme</span>
          </button>

          {/* Stats */}
          <button
            onClick={onStats}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors active:scale-95"
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Stats</span>
          </button>

          {/* Suggest Event - Main Action */}
          <button
            onClick={onSuggest}
            className="flex flex-col items-center gap-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all -mt-6"
          >
            <span className="text-3xl">+</span>
            <span className="text-xs font-bold">Create</span>
          </button>

          {/* Username */}
          <button
            onClick={username ? undefined : onSetUsername}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors active:scale-95"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-[60px]">
              {username || 'Login'}
            </span>
          </button>

          {/* Menu placeholder for future features */}
          <button
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors active:scale-95 opacity-50 cursor-not-allowed"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
