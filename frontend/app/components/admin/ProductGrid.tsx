'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  onProductUpdate: () => void;
  searchTerm: string;
  filterCategory: string;
}

export default function ProductGrid({ 
  products, 
  onProductUpdate, 
  searchTerm, 
  filterCategory 
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
          </span>
          
          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-accent text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              🔲 Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-accent text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              📋 Liste
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:border-accent focus:outline-none"
          >
            <option value="createdAt" className="bg-gray-800">Date de création</option>
            <option value="name" className="bg-gray-800">Nom</option>
            <option value="price" className="bg-gray-800">Prix</option>
            <option value="stock" className="bg-gray-800">Stock</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">📦</div>
          <h3 className="text-white text-xl font-bold mb-2">Aucun produit trouvé</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || filterCategory 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Commencez par ajouter votre premier produit'
            }
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdate={onProductUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left py-4 px-6 text-white font-semibold">Produit</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Catégorie</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Prix</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Stock</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Statut</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => {
                      const stockStatus = product.stock === 0 ? 'danger' : product.stock < 5 ? 'warning' : 'success';
                      return (
                        <tr 
                          key={product.id} 
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                            index % 2 === 0 ? 'bg-white/2' : ''
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                                {product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/50">
                                    📦
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">{product.name}</p>
                                <p className="text-white/60 text-sm line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white/70">{product.category}</td>
                          <td className="py-4 px-6 text-white font-semibold">{formatPrice(product.price)}</td>
                          <td className="py-4 px-6">
                            <span className="text-white font-bold">{product.stock}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              stockStatus === 'danger' ? 'bg-red-500/20 text-red-400' :
                              stockStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {stockStatus === 'danger' ? 'Rupture' :
                               stockStatus === 'warning' ? 'Faible' : 'Suffisant'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                                👁️ Voir
                              </button>
                              <button className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm">
                                ✏️ Modifier
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}