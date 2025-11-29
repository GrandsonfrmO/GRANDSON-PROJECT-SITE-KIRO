'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 group bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black p-4 rounded-full shadow-2xl hover:shadow-accent/25 transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-in"
      aria-label="Retour en haut"
    >
      <svg 
        className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={3} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent to-green-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
    </button>
  );
}