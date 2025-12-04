'use client';

import { useState, useEffect } from 'react';

interface FilterOptions {
  priceRange: [number, number];
  inStock: boolean;
  categories: string[];
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

export default function AdvancedFilters({
  onFilterChange,
  categories,
  minPrice,
  maxPrice,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [minPrice, maxPrice],
    inStock: false,
    categories: [],
    sortBy: 'newest',
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number];
    newRange[index] = value;
    setFilters({ ...filters, priceRange: newRange });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    setFilters({ ...filters, categories: newCategories });
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [minPrice, maxPrice],
      inStock: false,
      categories: [],
      sortBy: 'newest',
    });
  };

  const activeFiltersCount = 
    (filters.inStock ? 1 : 0) + 
    filters.categories.length +
    (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice ? 1 : 0);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-700 hover:border-accent hover:bg-neutral-50 transition-all"
        aria-label="Filtres avancés"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtres
        {activeFiltersCount > 0 && (
          <span className="bg-accent text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-neutral-200 z-50 p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-lg font-black text-neutral-900">Filtres Avancés</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Fermer les filtres"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-3">
                Fourchette de Prix
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, parseInt(e.target.value) || minPrice)}
                    className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Min"
                    min={minPrice}
                    max={filters.priceRange[1]}
                  />
                  <span className="text-neutral-400">-</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, parseInt(e.target.value) || maxPrice)}
                    className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Max"
                    min={filters.priceRange[0]}
                    max={maxPrice}
                  />
                </div>
                <div className="text-xs text-neutral-500 text-center">
                  {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} GNF
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-neutral-300 text-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                />
                <span className="text-sm font-semibold text-neutral-700 group-hover:text-accent transition-colors">
                  Uniquement en stock
                </span>
              </label>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3">
                  Catégories
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 rounded border-2 border-neutral-300 text-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                      />
                      <span className="text-sm text-neutral-700 group-hover:text-accent transition-colors">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-3">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 font-semibold cursor-pointer"
              >
                <option value="newest">Plus récents</option>
                <option value="name">Nom A-Z</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-accent hover:bg-green-500 text-black font-bold rounded-xl transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
