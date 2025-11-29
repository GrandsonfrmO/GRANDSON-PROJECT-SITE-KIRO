'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import ErrorBoundary from './ErrorBoundary';
import OfflineIndicator from './OfflineIndicator';
import ScrollToTop from './ScrollToTop';
import { ToastProvider } from '../context/ToastContext';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
          <Header />
          <main className={`grow w-full ${className}`}>
            {/* Main content wrapper with mobile-first padding */}
            <div className="w-full">
              {children}
            </div>
          </main>
          <Footer />
          <BottomNavigation />
          <OfflineIndicator />
          <ScrollToTop />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
