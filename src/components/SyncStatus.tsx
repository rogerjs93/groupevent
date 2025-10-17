import { useState } from 'react';

interface SyncStatusProps {
  show: boolean;
  onClose: () => void;
}

export default function SyncStatus({ show, onClose }: SyncStatusProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  if (!show) return null;

  const getNextSyncDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    return nextMonth.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    });
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setError('');
    setResult(null);

    try {
      const secret = prompt('Enter CRON_SECRET to authorize manual sync:');
      if (!secret) {
        setSyncing(false);
        return;
      }

      const response = await fetch('/api/syncTurkuEvents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">🗓️ Monthly Event Sync</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Next Sync Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <span>⏰</span> Next Automatic Sync
            </h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getNextSyncDate()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Automatically runs on the 1st of every month at 00:00 UTC
            </p>
          </div>

          {/* What Gets Synced */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>📋</span> What Gets Synced
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Fetches upcoming Turku events from MyHelsinki API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Filters events within the next 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Adds up to 10 new unique events per month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Prevents duplicates by checking event titles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Events appear in Community Events with voting enabled</span>
              </li>
            </ul>
          </div>

          {/* Manual Sync Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span>🔄</span> Manual Sync
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Requires CRON_SECRET for authorization. Only use if you need immediate sync.
            </p>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {syncing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </span>
              ) : (
                'Trigger Manual Sync Now'
              )}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                <span>✅</span> Sync Successful
              </h4>
              <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <p>Added: {result.added} new events</p>
                <p>Fetched: {result.fetched} total events</p>
                {result.events && result.events.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">New Events:</p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {result.events.map((event: any) => (
                        <li key={event.id}>{event.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <span>❌</span> Sync Failed
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Events are automatically synced to keep content fresh. Manual sync is rarely needed.
          </p>
        </div>
      </div>
    </div>
  );
}
