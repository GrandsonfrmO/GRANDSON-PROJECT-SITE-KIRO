'use client';

import { useState } from 'react';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
  totalProducts: number;
  filteredCount: number;
}

export default function ProductFilters({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories,
  totalProducts,
  filteredCount
}: ProductFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
  };

  const hasActiveFilters = searchTerm || filterCategory;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h3 className="text-white font-bold text-lg">Filtres et recherche</h3>
            <p className="text-white/60 text-sm">
              {filteredCount} sur {totalProducts} produits affichés
            </p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            🗑️ Effacer les filtres
          </button>
        )}
      </div>

      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-white font-medium mb-2">Rechercher</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, description..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-accent focus:outline-none transition-colors"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
              🔍
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-white font-medium mb-2">Catégorie</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-accent focus:outline-none transition-colors"
          >
            <option value="" className="bg-gray-800">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800">
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="block text-white font-medium mb-2">Actions rapides</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterCategory('')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !filterCategory 
                  ? 'bg-accent text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSearchTerm('stock:0')}
              className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              Rupture
            </button>
            <button
              onClick={() => setSearchTerm('stock:low')}
              className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-medium"
            >
              Stock faible
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
        >
          <span className={`transform transition-transform ${showAdvancedFilters ? 'rotate-90' : ''}`}>
            ▶️
          </span>
          Filtres avancés
        </button>

        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/5 rounded-xl">
            {/* Price Range */}
            <div>
              <label className="block text-white font-medium mb-2">Prix (GNF)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Stock Range */}
            <div>
              <label className="block text-white font-medium mb-2">Stock</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-white font-medium mb-2">Date de création</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-accent focus:outline-none text-sm">
                <option value="" className="bg-gray-800">Toutes les dates</option>
                <option value="today" className="bg-gray-800">Aujourd'hui</option>
                <option value="week" className="bg-gray-800">Cette semaine</option>
                <option value="month" className="bg-gray-800">Ce mois</option>
                <option value="year" className="bg-gray-800">Cette année</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-white font-medium mb-2">Statut stock</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-accent focus:outline-none text-sm">
                <option value="" className="bg-gray-800">Tous les statuts</option>
                <option value="sufficient" className="bg-gray-800">Stock suffisant</option>
                <option value="low" className="bg-gray-800">Stock faible</option>
                <option value="out" className="bg-gray-800">Rupture de stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
          <span className="text-white/70 text-sm">Filtres actifs:</span>
          {searchTerm && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2">
              Recherche: "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="hover:text-blue-300"
              >
                ✕
              </button>
            </span>
          )}
          {filterCategory && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2">
              Catégorie: {filterCategory}
              <button
                onClick={() => setFilterCategory('')}
                className="hover:text-purple-300"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}