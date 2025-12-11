'use client';

import { useState, ChangeEvent } from 'react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');

    // Validation de la taille des fichiers (5 MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB en bytes
    const oversizedFiles: string[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.size > MAX_SIZE) {
        oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    });

    if (oversizedFiles.length > 0) {
      setError(
        `❌ Fichier(s) trop volumineux (max 5 MB):\n${oversizedFiles.join('\n')}\n\n💡 Conseil: Compressez vos images avec TinyPNG ou Squoosh`
      );
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      console.log('📤 Upload de', files.length, 'fichier(s)');
      
      const uploadedUrls: string[] = [];
      
      // Upload each file individually
      for (const file of Array.from(files)) {
        console.log('  📎', file.name, '-', (file.size / 1024).toFixed(2), 'KB');
        
        const formData = new FormData();
        formData.append('image', file);

        console.log('🚀 Envoi de la requête pour', file.name);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur upload ${file.name}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Réponse reçue:', data);

        if (data.success && data.data?.url) {
          console.log('✅ Upload réussi:', data.data.url);
          uploadedUrls.push(data.data.url);
        } else {
          console.error('❌ Réponse invalide:', data);
          throw new Error(data.error?.message || 'Échec du téléchargement');
        }
      }
      
      // Add all uploaded URLs to the images list
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      const error = err as Error;
      console.error('❌ Erreur upload:', error);
      
      // Messages d'erreur plus clairs
      let errorMessage = error.message;
      if (errorMessage.includes('File too large')) {
        errorMessage = '❌ Fichier trop volumineux (max 5 MB). Compressez votre image et réessayez.';
      } else if (errorMessage.includes('Invalid')) {
        errorMessage = '❌ Format de fichier non supporté. Utilisez JPG, PNG ou GIF.';
      }
      
      setError(errorMessage || 'Erreur lors du téléchargement des images');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-4">
        <label className="inline-block px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg cursor-pointer transition-colors">
          {uploading ? 'Téléchargement...' : '+ Ajouter des images'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-neutral-500 text-sm mt-2">
          Formats acceptés: JPG, PNG, GIF (max 5MB par image)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
              {error.includes('trop volumineux') && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                  <p className="text-blue-400 text-xs font-semibold mb-2">💡 Outils de compression gratuits:</p>
                  <ul className="text-blue-300 text-xs space-y-1">
                    <li>• <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">TinyPNG</a> - Compression automatique</li>
                    <li>• <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">Squoosh</a> - Compression avancée</li>
                    <li>• Réduire la résolution à 1200x1200 pixels</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => {
            // Déterminer l'URL correcte de l'image
            let imageUrl = image;
            
            // Si c'est une URL complète (http/https), l'utiliser directement
            if (image.startsWith('http://') || image.startsWith('https://')) {
              imageUrl = image;
            }
            // Si c'est un chemin relatif, ajouter le préfixe localhost
            else if (image.startsWith('/')) {
              imageUrl = `http://localhost:3001${image}`;
            }
            // Sinon, c'est probablement une URL Supabase ou autre, l'utiliser directement
            else {
              imageUrl = image;
            }
            
            return (
              <div
                key={index}
                className="relative group aspect-square bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700"
              >
                <img
                  src={imageUrl}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si l'image ne charge pas, afficher un placeholder
                    const img = e.target as HTMLImageElement;
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="12" fill="%239CA3AF" text-anchor="middle" dominant-baseline="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent text-white text-xs font-semibold rounded">
                    Principal
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
