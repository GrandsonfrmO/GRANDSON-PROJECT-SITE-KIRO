'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show toast
    setIsVisible(true);
    
    // Auto hide after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          progressColor: 'bg-yellow-500'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          progressColor: 'bg-blue-500'
        };
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          progressColor: 'bg-blue-500'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transform transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div
        className={`${config.bgColor} ${config.borderColor} backdrop-blur-xl border rounded-2xl p-4 shadow-2xl max-w-sm relative overflow-hidden`}
      >
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
          <div
            className={`h-full ${config.progressColor} transition-all ease-linear`}
            style={{
              width: isLeaving ? '0%' : '100%',
              transitionDuration: isLeaving ? '300ms' : `${duration}ms`
            }}
          />
        </div>

        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`${config.textColor} font-semibold text-sm leading-relaxed`}>
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0 ml-2"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Manager Component
interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastManagerProps {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}

export function ToastManager({ toasts, removeToast }: ToastManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 9999 - index 
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Hook for using toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => addToast(message, 'success', duration);
  const showError = (message: string, duration?: number) => addToast(message, 'error', duration);
  const showWarning = (message: string, duration?: number) => addToast(message, 'warning', duration);
  const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration);

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}