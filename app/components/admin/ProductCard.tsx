'use client';

import { useState } from 'react';
import { Product } from '../../types';
import { authStorage } from '@/app/lib/authStorage';

interface ProductCardProps {
  product: Product;
  onUpdate: () => void;
}

export default function ProductCard({ product, onUpdate }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      const token = authStorage.getToken();
      if (!token) {
        alert('Session expirée, veuillez vous reconnecter');
        return;
      }
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
        const token = authStorage.getToken();
        if (!token) {
          alert('Session expirée, veuillez vous reconnecter');
          return;
        }
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
        {product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
            onClick={() => setShowEditModal(true)}
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
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-2">
                <span className="text-white/60 text-xs font-semibold">Tailles: </span>
                <span className="text-white/80 text-xs">{product.sizes.join(', ')}</span>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="text-white/60 text-xs font-semibold">Couleurs: </span>
                <span className="text-white/80 text-xs">{product.colors.join(', ')}</span>
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
            onClick={() => setShowEditModal(true)}
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

      {/* Edit Modal */}
      {showEditModal && (
        <EditProductModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Edit Product Modal Component
interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

function EditProductModal({ product, onClose, onUpdate }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    category: product.category,
    sizes: product.sizes || [],
    colors: product.colors || [],
    stock: product.stock.toString(),
    images: product.images.join(', ')
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Tshirt',
    'Survêtement',
    'Pull',
    'Accessoires',
    'Masque',
    'Casquette',
    'Bonnet'
  ];

  const toggleSize = (size: string) => {
    if (formData.sizes.includes(size)) {
      setFormData({...formData, sizes: formData.sizes.filter(s => s !== size)});
    } else {
      setFormData({...formData, sizes: [...formData.sizes, size]});
    }
  };

  const toggleColor = (color: string) => {
    if (formData.colors.includes(color)) {
      setFormData({...formData, colors: formData.colors.filter(c => c !== color)});
    } else {
      setFormData({...formData, colors: [...formData.colors, color]});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          sizes: formData.sizes,
          colors: formData.colors,
          stock: parseInt(formData.stock),
          images: formData.images.split(',').map(i => i.trim()).filter(i => i)
        }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 w-full max-w-5xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">✏️</span>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold">Modifier le produit</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-mobile-1 grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-white font-medium mb-2">Nom du produit *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/50 bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                placeholder="Ex: Boubou Traditionnel"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Prix (GNF) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/50 bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                placeholder="85000"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/50 bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                placeholder="25"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Catégorie *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-white bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                placeholder="Description du produit..."
              />
            </div>
          </div>

          {/* Variantes */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-white font-medium text-lg mb-5">Variantes</h4>
            
            <div className="grid grid-mobile-1 grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tailles */}
              <div>
                <label className="block text-white/80 text-sm mb-3">Tailles disponibles</label>
                <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.sizes.includes(size)
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
                {formData.sizes.length > 0 && (
                  <p className="text-emerald-400 text-xs mt-2">
                    ✓ {formData.sizes.length} taille(s): {formData.sizes.join(', ')}
                  </p>
                )}
              </div>

              {/* Couleurs */}
              <div>
                <label className="block text-white/80 text-sm mb-3">Couleurs disponibles</label>
                <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Blanc', color: '#FFFFFF', border: true },
                  { name: 'Noir', color: '#000000' },
                  { name: 'Rouge', color: '#EF4444' },
                  { name: 'Bleu', color: '#3B82F6' },
                  { name: 'Vert', color: '#10B981' },
                  { name: 'Jaune', color: '#F59E0B' },
                  { name: 'Rose', color: '#EC4899' },
                  { name: 'Violet', color: '#8B5CF6' },
                  { name: 'Orange', color: '#F97316' },
                  { name: 'Marron', color: '#92400E' }
                ].map(({ name, color, border }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleColor(name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      formData.colors.includes(name)
                        ? 'bg-white/20 text-white ring-2 ring-white/60 shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full ${border ? 'border-2 border-gray-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                    {name}
                  </button>
                ))}
              </div>
                {formData.colors.length > 0 && (
                  <p className="text-emerald-400 text-xs mt-2">
                    ✓ {formData.colors.length} couleur(s): {formData.colors.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Mise à jour...
                </span>
              ) : (
                '✨ Mettre à jour'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}