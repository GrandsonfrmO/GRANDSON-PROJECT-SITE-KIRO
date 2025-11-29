'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BrandImageData {
  id: number;
  src: string;
  alt: string;
  file?: File;
}

export default function BrandImagesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [brandImages, setBrandImages] = useState<BrandImageData[]>([
    { id: 1, src: '', alt: 'Grandson Entertainment Logo' },
    { id: 2, src: '', alt: 'Made in Guinea Label' },
    { id: 3, src: '', alt: 'Grandson Horse Mascot' }
  ]);

  const [originalImages, setOriginalImages] = useState<BrandImageData[]>([]);

  useEffect(() => {
    fetchBrandImages();
  }, []);

  const fetchBrandImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/brand-images');
      const data = await response.json();

      if (data.success) {
        const images = [
          { id: 1, src: data.data.brandImage1, alt: 'Grandson Entertainment Logo' },
          { id: 2, src: data.data.brandImage2, alt: 'Made in Guinea Label' },
          { id: 3, src: data.data.brandImage3, alt: 'Grandson Horse Mascot' }
        ];
        setBrandImages(images);
        setOriginalImages(JSON.parse(JSON.stringify(images)));
      }
    } catch (error) {
      console.error('Error fetching brand images:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des images' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (imageId: number, file: File | null) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Format invalide. Utilisez PNG, JPG ou WebP.' });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Fichier trop volumineux. Maximum 2MB.' });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Update state
    setBrandImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, src: previewUrl, file }
        : img
    ));

    setMessage(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Upload images that have files
      const uploadPromises = brandImages.map(async (img) => {
        if (img.file) {
          const formData = new FormData();
          formData.append('file', img.file);
          formData.append('folder', 'brand');

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            return { id: img.id, url: uploadData.url };
          }
        }
        return { id: img.id, url: img.src };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Update database
      const updateData = {
        brandImage1: uploadedImages.find(img => img.id === 1)?.url,
        brandImage2: uploadedImages.find(img => img.id === 2)?.url,
        brandImage3: uploadedImages.find(img => img.id === 3)?.url
      };

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/brand-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Images de marque mises à jour avec succès!' });
        await fetchBrandImages();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Error saving brand images:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des images' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBrandImages(JSON.parse(JSON.stringify(originalImages)));
    setMessage(null);
  };

  const hasChanges = JSON.stringify(brandImages) !== JSON.stringify(originalImages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Images de Marque</h1>
        <p className="text-neutral-600">
          Gérez les trois images de marque affichées sur la page d'accueil avec effet de rotation 3D
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {brandImages.map((image, index) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Image {index + 1}
            </h3>
            <p className="text-sm text-neutral-600 mb-4">{image.alt}</p>

            {/* Preview with rotation effect */}
            <div className="mb-4">
              <div 
                className="relative aspect-square w-full bg-gradient-to-br from-black via-neutral-900 to-neutral-800 rounded-2xl border-2 border-white/10 shadow-xl overflow-hidden group"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {image.src ? (
                  <div 
                    className="relative w-full h-full p-6 animate-rotate-logo"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="300px"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* File input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Choisir une image
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => handleFileChange(image.id, e.target.files?.[0] || null)}
                className="block w-full text-sm text-neutral-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-accent file:text-white
                  hover:file:bg-accent/90
                  file:cursor-pointer cursor-pointer"
              />
              <p className="mt-2 text-xs text-neutral-500">
                PNG, JPG ou WebP. Max 2MB.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            hasChanges && !saving
              ? 'bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        
        <button
          onClick={handleCancel}
          disabled={!hasChanges || saving}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            hasChanges && !saving
              ? 'bg-white text-neutral-700 border-2 border-neutral-300 hover:border-neutral-400'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
