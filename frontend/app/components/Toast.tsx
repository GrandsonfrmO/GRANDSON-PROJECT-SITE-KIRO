'use client';

import { useState, useEffect } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
}

export default function Toast({ id, type, title, message, duration = 5000, onClose, action, image }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Show toast
    setIsVisible(true);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        if (newProgress <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return newProgress;
      });
    }, 50);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${getBackgroundColor()}
        border-l-4 rounded-xl shadow-xl backdrop-blur-sm p-4 mb-4 max-w-md w-full overflow-hidden
      `}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-opacity-20 w-full">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-100`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold ${getTextColor()}`}>
            {title}
          </h4>
          {message && (
            <p className={`text-sm mt-1 ${getTextColor()} opacity-80 line-clamp-2`}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className={`text-xs font-semibold mt-2 ${getTextColor()} hover:opacity-70 transition-opacity underline`}
            >
              {action.label}
            </button>
          )}
        </div>

        {image && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/50">
            <img src={image} alt="Product" className="w-full h-full object-cover" />
          </div>
        )}
        
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ${getTextColor()} hover:opacity-70 transition-opacity p-1`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
}