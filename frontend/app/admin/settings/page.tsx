'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoType, setLogoType] = useState<'text' | 'image'>('text');
  const [logoText, setLogoText] = useState('GRANDSON PROJECT');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        const { logo } = data.data;
        setLogoText(logo.text || 'GRANDSON PROJECT');
        setLogoImageUrl(logo.imageUrl || '');
        setLogoType(logo.imageUrl ? 'image' : 'text');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
      return;
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 2MB' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setLogoImageUrl(data.url);
        setMessage({ type: 'success', text: 'Image téléchargée avec succès' });
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Erreur lors du téléchargement' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement de l\'image' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const logo = {
        text: logoText,
        imageUrl: logoType === 'image' ? logoImageUrl : null
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logo }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Logo mis à jour avec succès' });
        // Recharger la page après 1 seconde pour voir le nouveau logo
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du logo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Paramètres du site</h1>
        <p className="text-gray-400">Configurez le logo de votre site</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-neutral-900 rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* Type de logo */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">Type de logo</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setLogoType('text')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  logoType === 'text'
                    ? 'bg-accent text-white'
                    : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                }`}
              >
                Texte
              </button>
              <button
                type="button"
                onClick={() => setLogoType('image')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  logoType === 'image'
                    ? 'bg-accent text-white'
                    : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {/* Texte du logo */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Texte du logo
              <span className="text-gray-400 text-sm font-normal ml-2">
                (utilisé comme texte alternatif si vous choisissez une image)
              </span>
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-300 placeholder-white/50 min-h-[48px]"
              placeholder="GRANDSON PROJECT"
              required
            />
          </div>

          {/* Upload d'image */}
          {logoType === 'image' && (
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Image du logo</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-center border-2 border-dashed border-gray-600 hover:border-accent">
                      {uploading ? 'Téléchargement...' : 'Choisir une image'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {logoImageUrl && (
                  <div className="relative w-full max-w-md">
                    <img
                      src={logoImageUrl}
                      alt="Logo preview"
                      className="w-full h-auto rounded-lg border-2 border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoImageUrl('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <p className="text-sm text-gray-400">
                  Format recommandé : PNG ou SVG avec fond transparent. Taille max : 2MB
                </p>
              </div>
            </div>
          )}

          {/* Aperçu */}
          <div className="mb-6 p-6 bg-black rounded-lg border border-gray-700">
            <p className="text-white font-semibold mb-3">Aperçu</p>
            <div className="flex items-center justify-center py-8 bg-neutral-900 rounded-lg">
              {logoType === 'image' && logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={logoText}
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <div className="text-3xl font-bold text-white uppercase tracking-tight">
                  {logoText}
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || uploading || (logoType === 'image' && !logoImageUrl)}
              className="flex-1 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black py-3 px-6 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/15 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
