import { getUserStats, getResetDate } from '../utils/rateLimiting';

interface UserStatsModalProps {
  onClose: () => void;
}

function UserStatsModal({ onClose }: UserStatsModalProps) {
  const stats = getUserStats();
  const remaining = 10 - stats.monthlyCount;
  const percentage = (stats.monthlyCount / 10) * 100;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white/10 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 animate-scale-in border border-purple-200/20 dark:border-purple-700/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Your Stats
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Event creation limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="space-y-6">
          {/* Monthly Progress */}
          <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {stats.monthlyCount} / 10 events
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-300/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {remaining > 0 ? (
                <>✨ {remaining} events remaining</>
              ) : (
                <>🚫 Limit reached. Resets {getResetDate()}</>
              )}
            </p>
          </div>

          {/* Lifetime Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl text-center border border-purple-200/30 dark:border-purple-700/30">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {stats.eventsCreated}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Events</div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl text-center border border-purple-200/30 dark:border-purple-700/30">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {stats.lastEventDate > 0
                  ? new Date(stats.lastEventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last Event</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/20 dark:bg-blue-500/20 border border-blue-500/40 dark:border-blue-400/40 rounded-xl p-4">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Rate Limits</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1 font-medium">
                  <li>• Maximum 10 events per month</li>
                  <li>• 5-minute cooldown between events</li>
                  <li>• Resets on the 1st of each month</li>
                  <li>• Helps prevent spam and ensures quality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reset Date */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Limit resets on <span className="text-purple-600 dark:text-purple-400 font-medium">{getResetDate()}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-2.5 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-200 dark:border-purple-700"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default UserStatsModal;
