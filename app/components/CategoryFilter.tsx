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
      {/* Desktop Layout - Premium Design */}
      <div className="hidden md:flex flex-wrap justify-center gap-4 lg:gap-5">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`group relative px-10 py-5 rounded-2xl text-base font-black uppercase tracking-wider transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-accent via-green-500 to-accent text-black shadow-2xl shadow-accent/40 border-3 border-accent/50'
              : 'bg-white text-neutral-700 hover:bg-gradient-to-br hover:from-neutral-50 hover:to-white border-3 border-neutral-300 hover:border-accent/50 shadow-xl hover:shadow-2xl'
          }`}
        >
          {/* Enhanced Shimmer effect */}
          {selectedCategory === null && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <span className="text-lg">Tous</span>
          </span>
          
          {selectedCategory === null && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-accent to-green-500 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
          )}
        </button>
        
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`group relative px-10 py-5 rounded-2xl text-base font-black uppercase tracking-wider transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-accent via-green-500 to-accent text-black shadow-2xl shadow-accent/40 border-3 border-accent/50'
                : 'bg-white text-neutral-700 hover:bg-gradient-to-br hover:from-neutral-50 hover:to-white border-3 border-neutral-300 hover:border-accent/50 shadow-xl hover:shadow-2xl'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Enhanced Shimmer effect */}
            {selectedCategory === category && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
            
            <span className="relative z-10 text-lg">{category}</span>
            
            {selectedCategory === category && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-accent to-green-500 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Layout - Enhanced Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`group relative px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wide transition-all duration-300 active:scale-95 whitespace-nowrap flex-shrink-0 snap-center ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-accent to-green-500 text-black shadow-xl border-2 border-accent/50'
                : 'bg-white text-neutral-700 border-2 border-neutral-300 shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <span>Tous</span>
            </span>
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`group relative px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wide transition-all duration-300 active:scale-95 whitespace-nowrap flex-shrink-0 snap-center ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-accent to-green-500 text-black shadow-xl border-2 border-accent/50'
                  : 'bg-white text-neutral-700 border-2 border-neutral-300 shadow-lg'
              }`}
            >
              <span className="relative z-10">{category}</span>
            </button>
          ))}
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center gap-1 mt-2">
          {[...Array(Math.min(categories.length + 1, 5))].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
          ))}
        </div>
      </div>

      {/* Enhanced Category Count */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-neutral-100 to-neutral-50 px-5 py-2.5 rounded-full border-2 border-neutral-200 shadow-md">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-neutral-700 text-sm font-black">
            {categories.length + 1} Catégorie{categories.length > 0 ? 's' : ''} Disponible{categories.length > 0 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
