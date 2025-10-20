export default function SkeletonCard() {
  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200 dark:border-purple-800 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Date/Time skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-32"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-24"></div>
      </div>

      {/* Stats skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-1"></div>
      </div>

      {/* Buttons skeleton */}
      <div className="flex gap-2">
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex-1"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex-1"></div>
      </div>
    </div>
  );
}
