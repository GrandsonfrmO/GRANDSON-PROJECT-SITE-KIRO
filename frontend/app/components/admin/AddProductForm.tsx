'use client';

import { useState, useRef } from 'react';
import { useToast, ToastManager } from './Toast';
import ImagePreview from './ImagePreview';
import { authStorage } from '@/app/lib/authStorage';

interface Product {
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: string[];
  images: string[];
  colors: string[];
  stock: string;
}

interface AddProductFormProps {
  onProductCreated: () => void;
  onCancel: () => void;
}

export default function AddProductForm({ onProductCreated, onCancel }: AddProductFormProps) {
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    description: '',
    price: '',
    category: '',
    sizes: [],
    images: [],
    colors: [],
    stock: ''
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Tshirt',
    'Survêtement',
    'Pull',
    'Accessoires',
    'Masque',
    'Casquette',
    'Bonnet'
  ];

  // Fonction de compression d'image
  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Redimensionner si nécessaire
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`📸 Image compressée: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Erreur chargement image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} n'est pas une image valide`);
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        showError(`${file.name} est trop volumineux (max 15MB)`);
        return false;
      }
      return true;
    });

    // Compresser chaque image
    for (const file of validFiles) {
      try {
        const compressedFile = await compressImage(file);
        setUploadedImages(prev => [...prev, compressedFile]);
        
        // Créer l'aperçu
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(compressedFile);
        
        showSuccess(`${file.name} compressée avec succès`);
      } catch (error) {
        console.error('Erreur compression:', error);
        showError(`Erreur compression ${file.name}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (uploadedImages.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of uploadedImages) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          throw new Error(`Erreur upload ${file.name}`);
        }
      }
      return uploadedUrls;
    } catch (error) {
      console.error('Erreur upload images:', error);
      showError('Erreur lors de l\'upload des images');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const createProduct = async () => {
    if (!newProduct.name.trim()) {
      showError('Le nom du produit est requis');
      return;
    }
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      showError('Le prix doit être supérieur à 0');
      return;
    }
    if (!newProduct.category) {
      showError('La catégorie est requise');
      return;
    }
    if (!newProduct.stock || parseInt(newProduct.stock) < 0) {
      showError('Le stock doit être un nombre positif');
      return;
    }

    try {
      setIsUploading(true);
      
      const imageUrls = await uploadImages();
      
      // Formater les données pour Supabase (snake_case et types corrects)
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || 'Aucune description',
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        sizes: newProduct.sizes.length > 0 ? newProduct.sizes : ['Unique'],
        colors: newProduct.colors.length > 0 ? newProduct.colors : [],
        images: imageUrls.length > 0 ? imageUrls : newProduct.images,
        is_active: true
      };
      
      console.log('📦 Données produit à envoyer:', productData);

      // Get token from authStorage (imported at top of file)
      const token = authStorage.getToken();
      
      if (!token) {
        showError('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        showSuccess('Produit créé avec succès!');
        resetForm();
        onProductCreated();
      } else {
        // Essayer de parser la réponse JSON, sinon utiliser le texte brut
        let errorMsg = 'Erreur lors de la création du produit';
        try {
          const errorData = await response.json();
          console.error('❌ Erreur création produit:', errorData);
          errorMsg = errorData.error?.message || errorMsg;
          
          // Afficher plus de détails dans la console pour le debug
          if (errorData.error?.details) {
            console.error('Détails:', errorData.error.details);
          }
        } catch (parseError) {
          console.error('❌ Erreur parsing réponse:', parseError);
          const textResponse = await response.text();
          console.error('Réponse brute:', textResponse);
          errorMsg = `Erreur serveur (${response.status}): ${textResponse.substring(0, 100)}`;
        }
        showError(errorMsg);
      }
    } catch (error: unknown) {
      console.error('Erreur création produit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      // Messages d'erreur plus explicites
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        showError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
      } else if (errorMessage.includes('timeout')) {
        showError('Le serveur met trop de temps à répondre. Réessayez.');
      } else {
        showError(`Erreur: ${errorMessage}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      sizes: [],
      images: [],
      colors: [],
      stock: ''
    });
    setUploadedImages([]);
    setImagePreviewUrls([]);
  };

  return (
    <div className="space-y-6">
      {/* Toast Manager pour afficher les notifications */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      {/* Header Simple */}
      <div className="glass-card rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <h3 className="text-white text-xl font-bold">Ajouter un Produit</h3>
          </div>
          <button 
            onClick={onCancel}
            className="btn-glass px-4 py-2 text-gray-300 rounded-xl hover:text-white transition-all"
          >
            ← Retour
          </button>
        </div>
      </div>
      
      {/* Formulaire Simple - Tout sur une page */}
      <div className="glass-primary backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="space-y-6">
          {/* Images - EN PREMIER */}
          <div>
            <h4 className="text-white font-medium mb-4">📷 Images du produit</h4>
            
            {/* Zone d'upload simple */}
            <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-white/50 transition-all">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-white/70 mb-2">Cliquez pour ajouter des images</p>
              <p className="text-white/50 text-xs mb-3">Max 15MB par image • Compression automatique</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-glass px-4 py-2 text-white rounded-xl hover:scale-105 transition-all"
              >
                Sélectionner
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Aperçu des images */}
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4">
                <ImagePreview
                  images={imagePreviewUrls}
                  onRemove={removeImage}
                  maxImages={6}
                  editable={true}
                />
              </div>
            )}
          </div>

          {/* Informations de base */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-white font-medium mb-4">📝 Informations du produit</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div className="md:col-span-2">
                <label className="block text-white font-medium mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="input-glass w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  placeholder="Ex: Boubou Traditionnel"
                />
              </div>

              {/* Prix */}
              <div>
                <label className="block text-white font-medium mb-2">Prix (GNF) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="input-glass w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  placeholder="85000"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-white font-medium mb-2">Stock *</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="input-glass w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  placeholder="25"
                />
              </div>

              {/* Catégorie */}
              <div className="md:col-span-2">
                <label className="block text-white font-medium mb-2">Catégorie *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="input-glass w-full px-4 py-3 rounded-xl text-white bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                >
                  <option value="" className="bg-gray-800">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={3}
                  className="input-glass w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-vertical bg-white/10 border border-white/20 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300"
                  placeholder="Description du produit..."
                />
              </div>
            </div>
          </div>

          {/* Variantes (optionnel) */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-white font-medium mb-4">🎨 Variantes (optionnel)</h4>
            
            {/* Tailles */}
            <div className="mb-4">
              <label className="block text-white/80 text-sm mb-3">Tailles disponibles</label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const currentSizes = newProduct.sizes;
                      if (currentSizes.includes(size)) {
                        setNewProduct({...newProduct, sizes: currentSizes.filter(s => s !== size)});
                      } else {
                        setNewProduct({...newProduct, sizes: [...currentSizes, size]});
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      newProduct.sizes.includes(size)
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {newProduct.sizes.length > 0 && (
                <p className="text-emerald-400 text-xs mt-2">
                  ✓ {newProduct.sizes.length} taille(s) sélectionnée(s): {newProduct.sizes.join(', ')}
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
                    onClick={() => {
                      const currentColors = newProduct.colors;
                      if (currentColors.includes(name)) {
                        setNewProduct({...newProduct, colors: currentColors.filter(c => c !== name)});
                      } else {
                        setNewProduct({...newProduct, colors: [...currentColors, name]});
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      newProduct.colors.includes(name)
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
              {newProduct.colors.length > 0 && (
                <p className="text-emerald-400 text-xs mt-2">
                  ✓ {newProduct.colors.length} couleur(s) sélectionnée(s): {newProduct.colors.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={createProduct}
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Création...
                </span>
              ) : (
                '✨ Créer le produit'
              )}
            </button>
            
            <button
              onClick={resetForm}
              disabled={isUploading}
              className="px-6 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              🗑️ Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}