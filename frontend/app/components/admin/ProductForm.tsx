'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Product } from '../../types';
import ImageUpload from '../admin/ImageUpload';
import ColorSelector from '../admin/ColorSelector';

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = ['T-Shirts', 'Sweats', 'Pantalons', 'Shorts', 'Jort', 'Survêtements', 'Bonnets', 'Masques', 'Casquettes'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Helper function to ensure value is always an array
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || CATEGORIES[0],
    stock: product?.stock || 0,
    isActive: product?.isActive ?? true,
    sizes: ensureArray(product?.sizes),
  });
  const [images, setImages] = useState<string[]>(ensureArray(product?.images));
  const [colors, setColors] = useState<string[]>(ensureArray(product?.colors));
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom du produit est requis');
      return;
    }
    if (formData.price <= 0) {
      setError('Le prix doit être supérieur à 0');
      return;
    }
    if (formData.stock < 0) {
      setError('Le stock ne peut pas être négatif');
      return;
    }
    if (formData.sizes.length === 0) {
      setError('Sélectionnez au moins une taille');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        images,
        colors,
      };

      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      if (product) {
        // Update existing product - use fetch directly to Next.js API route
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error?.message || 'Erreur lors de la mise à jour');
        }
      } else {
        // Create new product - use fetch directly to Next.js API route
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error?.message || 'Erreur lors de la création');
        }
      }

      onSuccess();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Erreur lors de la sauvegarde du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-6 uppercase">
        {product ? 'Modifier le produit' : 'Nouveau produit'}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase">
            Nom du produit *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Ex: T-Shirt Grandson Classic"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            placeholder="Description du produit..."
          />
        </div>

        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase">
              Catégorie *
            </label>
            {!showCustomCategory ? (
              <div className="space-y-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="text-accent hover:text-accent/80 text-sm font-semibold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer une nouvelle catégorie
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    setFormData((prev) => ({ ...prev, category: e.target.value }));
                  }}
                  placeholder="Ex: Vestes, Chaussures..."
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                    setFormData((prev) => ({ ...prev, category: CATEGORIES[0] }));
                  }}
                  className="text-neutral-400 hover:text-neutral-300 text-sm font-semibold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour aux catégories existantes
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase">
              Prix (GNF) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="50000"
              min="0"
              required
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase">
            Stock *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="10"
            min="0"
            required
          />
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-semibold text-neutral-300 mb-3 uppercase">
            Tailles disponibles *
          </label>
          <div className="flex flex-wrap gap-3">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  formData.sizes.includes(size)
                    ? 'bg-accent text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-semibold text-neutral-300 mb-3 uppercase">
            Couleurs disponibles (optionnel)
          </label>
          <ColorSelector selectedColors={colors} onChange={setColors} />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-neutral-300 mb-3 uppercase">
            Images du produit
          </label>
          <ImageUpload images={images} onChange={handleImagesChange} />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="w-5 h-5 rounded border-neutral-600 bg-neutral-900 text-accent focus:ring-2 focus:ring-accent"
          />
          <label htmlFor="isActive" className="text-neutral-300 font-semibold">
            Produit actif (visible sur le site)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-accent hover:bg-accent/90 text-white font-bold uppercase rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Créer le produit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
