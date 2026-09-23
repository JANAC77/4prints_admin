import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200';
      case 'error':
        return 'border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
      case 'warning':
        return 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200';
      default:
        return 'border-indigo-500/30 bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            id={`toast-${item.id}`}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-fade-in ${getToastStyles(
              item.type
            )}`}
          >
            <div className="flex items-center space-x-3 mr-2">
              {getToastIcon(item.type)}
              <p className="text-sm font-medium leading-relaxed">{item.message}</p>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
