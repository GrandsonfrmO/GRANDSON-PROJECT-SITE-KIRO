'use client';

import { useState, useCallback } from 'react';
import { ToastProps } from '../components/Toast';

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      id,
      ...options,
      onClose: () => removeToast(id),
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number, action?: ToastOptions['action'], image?: string) => {
    return addToast({ type: 'success', title, message, duration, action, image });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number, action?: ToastOptions['action'], image?: string) => {
    return addToast({ type: 'error', title, message, duration, action, image });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number, action?: ToastOptions['action'], image?: string) => {
    return addToast({ type: 'warning', title, message, duration, action, image });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number, action?: ToastOptions['action'], image?: string) => {
    return addToast({ type: 'info', title, message, duration, action, image });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}