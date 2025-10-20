import { useToast } from '../contexts/ToastContext';
import { useEffect, useState } from 'react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  useEffect(() => {
    // Auto-close animation
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const typeStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-yellow-500 border-yellow-600',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div
      className={`
        ${typeStyles[toast.type as keyof typeof typeStyles]}
        ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
        text-white px-4 py-3 rounded-lg shadow-2xl border-2
        backdrop-blur-sm flex items-center gap-3 min-w-[300px]
        transition-all duration-300 hover:scale-105
      `}
    >
      <span className="text-2xl">{icons[toast.type as keyof typeof icons]}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{toast.message}</p>
      </div>
      {toast.action && (
        <button
          onClick={() => {
            toast.action.onClick();
            handleClose();
          }}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm font-semibold transition-colors"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={handleClose}
        className="text-white/80 hover:text-white transition-colors ml-2"
      >
        ✕
      </button>
    </div>
  );
}
