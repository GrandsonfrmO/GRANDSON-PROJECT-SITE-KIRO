'use client';

import { useState } from 'react';
import { Product } from '../../types';
import { getImageUrl } from '../../lib/imageOptimization';

interface ProductCardProps {
  product: Product;
  onUpdate: () => void;
  onEdit?: (product: Product) => void;
}

export default function ProductCard({ product, onUpdate, onEdit }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: !product.isActive
        }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur toggle status:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          onUpdate();
        } else {
          const error = await response.json();
          alert(error.error?.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { color: 'bg-red-500/20 text-red-400', text: 'Rupture' };
    if (product.stock < 5) return { color: 'bg-yellow-500/20 text-yellow-400', text: 'Stock faible' };
    if (product.stock < 10) return { color: 'bg-orange-500/20 text-orange-400', text: 'Stock moyen' };
    return { color: 'bg-green-500/20 text-green-400', text: 'En stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-3xl overflow-hidden hover:bg-white/15 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        {product.images && product.images[0] && !imageError ? (
          <img 
            src={getImageUrl(product.images[0], 'thumbnail')} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-gradient-to-br from-neutral-200 to-neutral-300">
            <span className="text-4xl md:text-6xl">📦</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 md:top-3 left-2 md:left-3">
          <span className={`text-xs px-2 md:px-3 py-1 rounded-full font-bold backdrop-blur-sm ${
            product.isActive !== false
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            {product.isActive !== false ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3">
          <span className={`text-xs px-2 md:px-3 py-1 rounded-full font-bold backdrop-blur-sm ${stockStatus.color}`}>
            <span className="hidden sm:inline">{product.stock} unités</span>
            <span className="sm:hidden">{product.stock}</span>
          </span>
        </div>

        {/* Quick Actions Overlay - Hidden on mobile, shown on hover on desktop */}
        <div className="absolute inset-0 bg-black/50 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            title="Voir détails"
          >
            <span className="text-base md:text-lg">👁️</span>
          </button>
          <button
            onClick={() => onEdit?.(product)}
            className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-full text-white hover:bg-blue-500 transition-colors"
            title="Modifier"
          >
            <span className="text-base md:text-lg">✏️</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mobile-px mobile-py p-4 md:p-6">
        <div className="mb-3 md:mb-4">
          <h4 className="text-white font-bold text-responsive-xl text-base md:text-lg mb-1 truncate" title={product.name}>
            {product.name}
          </h4>
          <p className="text-white/60 text-xs md:text-sm mb-2">{product.category}</p>
          <p className="text-accent font-bold text-lg md:text-xl">{formatPrice(product.price)}</p>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <span className={`text-xs px-2 md:px-3 py-1 rounded-full font-bold ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
          <span className="text-white/60 text-xs md:text-sm">
            {product.stock} en stock
          </span>
        </div>

        {/* Mobile Details Toggle Button */}
        <div className="md:hidden mb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="touch-target w-full py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-semibold"
          >
            <span className="mr-1">👁️</span>
            {showDetails ? 'Masquer détails' : 'Voir détails'}
          </button>
        </div>

        {/* Additional Info (when expanded) */}
        {showDetails && (
          <div className="mb-3 md:mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
            {product.description && (
              <p className="text-white/70 text-xs md:text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
            )}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mb-2">
                <span className="text-white/60 text-xs font-semibold">Tailles: </span>
                <span className="text-white/80 text-xs">{(Array.isArray(product.sizes) ? product.sizes : []).join(', ')}</span>
              </div>
            )}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <span className="text-white/60 text-xs font-semibold">Couleurs: </span>
                <span className="text-white/80 text-xs">{(Array.isArray(product.colors) ? product.colors : []).join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleToggleStatus}
            disabled={isLoading}
            className={`touch-target flex-1 py-2 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold disabled:opacity-50 ${
              product.isActive !== false
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 md:hover:scale-105'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 md:hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                <span>...</span>
              </div>
            ) : (
              <>
                <span className="mr-1">{product.isActive !== false ? '⏸️' : '▶️'}</span>
                <span className="hidden sm:inline">{product.isActive !== false ? 'Désactiver' : 'Activer'}</span>
                <span className="sm:hidden">{product.isActive !== false ? 'Off' : 'On'}</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => onEdit?.(product)}
            disabled={isLoading}
            className="touch-target flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 md:hover:scale-105 transition-all duration-300 text-xs md:text-sm font-semibold disabled:opacity-50"
          >
            <span className="mr-1">✏️</span>
            <span className="hidden sm:inline">Modifier</span>
            <span className="sm:hidden">Edit</span>
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={isLoading}
            className="touch-target flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 md:hover:scale-105 transition-all duration-300 text-xs md:text-sm font-semibold disabled:opacity-50"
          >
            <span className="mr-1">🗑️</span>
            <span className="hidden sm:inline">Supprimer</span>
            <span className="sm:hidden">Suppr.</span>
          </button>
        </div>
      </div>
    </div>
  );
}