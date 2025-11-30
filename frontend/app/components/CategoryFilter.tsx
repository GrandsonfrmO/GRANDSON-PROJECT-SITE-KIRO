'use client';

import { useState, useEffect } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    // Check if categories overflow and need scrolling on mobile
    setIsScrollable(categories.length > 3);
  }, [categories]);

  const handleCategoryClick = (category: string | null) => {
    onCategoryChange(category);
    
    // Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="relative">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-wrap justify-center gap-4 lg:gap-6">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`group relative px-8 py-4 rounded-2xl text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-accent to-green-500 text-black shadow-xl shadow-accent/25 border-2 border-transparent'
              : 'bg-white text-neutral-700 hover:bg-neutral-50 border-2 border-neutral-200 hover:border-accent/40 shadow-lg hover:shadow-xl'
          }`}
        >
          {/* Shimmer effect for active button */}
          {selectedCategory === null && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-lg">🏠</span>
            Tous
          </span>
          
          {selectedCategory === null && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          )}
        </button>
        
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`group relative px-8 py-4 rounded-2xl text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-accent to-green-500 text-black shadow-xl shadow-accent/25 border-2 border-transparent'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border-2 border-neutral-200 hover:border-accent/40 shadow-lg hover:shadow-xl'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Shimmer effect for active button */}
            {selectedCategory === category && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
            
            <span className="relative z-10">{category}</span>
            
            {selectedCategory === category && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Layout - Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`group relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 active:scale-95 whitespace-nowrap flex-shrink-0 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-accent to-green-500 text-black shadow-lg'
                : 'bg-white text-neutral-700 border border-neutral-200 shadow-sm'
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="text-sm">🏠</span>
              Tous
            </span>
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`group relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 active:scale-95 whitespace-nowrap flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-accent to-green-500 text-black shadow-lg'
                  : 'bg-white text-neutral-700 border border-neutral-200 shadow-sm'
              }`}
            >
              <span className="relative z-10">{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Count */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-neutral-600 text-xs font-semibold">
            {categories.length + 1} catégorie{categories.length > 0 ? 's' : ''} disponible{categories.length > 0 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
