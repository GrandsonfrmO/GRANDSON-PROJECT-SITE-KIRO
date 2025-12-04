'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1048576 : undefined; // Convert to MB

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: memoryUsage ? Math.round(memoryUsage) : undefined,
      });
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all"
        title="Performance Metrics"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Metrics Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 w-72 border-2 border-purple-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Performance
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <span className="text-neutral-700">Load Time:</span>
              <span className={`font-bold ${metrics.loadTime < 1000 ? 'text-green-600' : metrics.loadTime < 3000 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.loadTime}ms
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <span className="text-neutral-700">Render Time:</span>
              <span className={`font-bold ${metrics.renderTime < 100 ? 'text-green-600' : metrics.renderTime < 300 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.renderTime}ms
              </span>
            </div>

            {metrics.memoryUsage && (
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-neutral-700">Memory:</span>
                <span className={`font-bold ${metrics.memoryUsage < 50 ? 'text-green-600' : metrics.memoryUsage < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.memoryUsage}MB
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-xs text-neutral-500 text-center">
              Development Mode Only
            </p>
          </div>
        </div>
      )}
    </>
  );
}
