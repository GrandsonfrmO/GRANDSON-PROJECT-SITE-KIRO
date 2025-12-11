'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '../lib/seoPerformance';

export function SEOAnalytics() {
  useEffect(() => {
    // Track Web Vitals
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(reportWebVitals);
        getFID(reportWebVitals);
        getFCP(reportWebVitals);
        getLCP(reportWebVitals);
        getTTFB(reportWebVitals);
      });
    }

    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }

    // Track user engagement
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage > 25 && scrollPercentage < 30) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'scroll_depth', {
            depth: '25%',
          });
        }
      }
      if (scrollPercentage > 50 && scrollPercentage < 55) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'scroll_depth', {
            depth: '50%',
          });
        }
      }
      if (scrollPercentage > 75 && scrollPercentage < 80) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'scroll_depth', {
            depth: '75%',
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}

export function TrackEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }
}

export function TrackConversion(conversionId: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      conversion_id: conversionId,
      value,
    });
  }
}
