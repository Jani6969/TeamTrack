'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }: { type?: ToastType; title?: string; message: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => toast({ type: 'success', title, message }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ type: 'error', title, message, duration: 6000 }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ type: 'info', title, message }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ type: 'warning', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container - positioned at top-right for optimal visibility */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border transition-all animate-slide-down ${
              t.type === 'success'
                ? 'bg-white text-slate-900 border-emerald-500 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                : t.type === 'error'
                ? 'bg-white text-slate-900 border-rose-500 shadow-rose-500/15 ring-1 ring-rose-500/20'
                : t.type === 'warning'
                ? 'bg-white text-slate-900 border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/20'
                : 'bg-white text-slate-900 border-slate-300 shadow-slate-500/10 ring-1 ring-slate-200'
            }`}
          >
            <div
              className={`mt-0.5 p-1.5 rounded-xl shrink-0 ${
                t.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : t.type === 'error'
                  ? 'bg-rose-50 text-rose-600'
                  : t.type === 'warning'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {t.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              {t.title && <div className="font-bold text-slate-900 mb-0.5">{t.title}</div>}
              <div className="font-medium text-slate-700 leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Dismiss notification"
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
