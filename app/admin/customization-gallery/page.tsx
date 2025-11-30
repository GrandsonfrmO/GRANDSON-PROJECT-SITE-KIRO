'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import AdminHeader from '@/app/components/admin/AdminHeader';
import { ToastManager, useToast } from '@/app/components/admin/Toast';
import { authStorage } from '@/app/lib/authStorage';

interface GalleryItem {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export default function CustomizationGalleryPage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authStorage.isAuthenticated();
      if (!isAuth) {
        router.push('/admin/mobile-login');
        return;
      }
      const authData = authStorage.getAuthData();
      if (authData) {
        setUser(authData.user);
      }
      setLoading(false);
      fetchItems();
    };
    checkAuth();
  }, [router]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/admin/customization-gallery');
      const data = await response.json();
      if (data.success) {
        setItems(data.data?.items || []);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
    return null;
  };

  const saveItem = async (item: GalleryItem) => {
    setIsUploading(true);
    try {
      const token = authStorage.getToken();
      const response = await fetch('/api/admin/customization-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Image sauvegardée !');
        fetchItems();
        setEditingItem(null);
      } else {
        showError(data.error?.message || 'Erreur');
      }
    } catch (error) {
      showError('Erreur de sauvegarde');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return;

    try {
      const token = authStorage.getToken();
      const response = await fetch(`/api/admin/customization-gallery?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        showSuccess('Image supprimée');
        fetchItems();
      }
    } catch (error) {
      showError('Erreur de suppression');
    }
  };

  const handleLogout = () => {
    authStorage.clearAuthData();
    router.push('/admin/mobile-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminUser={user}
          onLogout={handleLogout}
          stats={{ pendingOrders: 0, lowStockProducts: 0 }}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <div className="flex-1 lg:ml-64">
          <AdminHeader
            activeTab={activeTab}
            sidebarCollapsed={false}
            stats={{ pendingOrders: 0, lowStockProducts: 0 }}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          
          <main className="p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Galerie Personnalisation</h1>
                  <p className="text-white/60">Gérez les images de la page personnalisation</p>
                </div>
                <button
                  onClick={() => setEditingItem({ title: '', subtitle: '', image_url: '', display_order: items.length, is_active: true })}
                  className="px-4 py-2 bg-accent text-black font-bold rounded-xl hover:scale-105 transition-all"
                >
                  + Ajouter
                </button>
              </div>

              {/* Liste des images */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="relative group bg-white/10 rounded-xl overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-white/5 flex items-center justify-center text-4xl">📷</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                      <p className="text-white font-bold text-center px-2">{item.title}</p>
                      <p className="text-white/70 text-sm">{item.subtitle}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => item.id && deleteItem(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal d'édition */}
              {editingItem && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
                    <h2 className="text-xl font-bold text-white mb-4">
                      {editingItem.id ? 'Modifier' : 'Ajouter'} une image
                    </h2>
                    
                    {/* Image preview */}
                    <div className="mb-4">
                      {editingItem.image_url ? (
                        <img src={editingItem.image_url} alt="Preview" className="w-full aspect-square object-cover rounded-xl" />
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-square bg-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
                        >
                          <span className="text-4xl mb-2">📷</span>
                          <span className="text-white/60">Cliquez pour ajouter</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            const url = await handleImageUpload(file);
                            if (url) {
                              setEditingItem({ ...editingItem, image_url: url });
                            }
                            setIsUploading(false);
                          }
                        }}
                      />
                      {editingItem.image_url && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                        >
                          Changer l'image
                        </button>
                      )}
                    </div>

                    {/* Titre */}
                    <input
                      type="text"
                      placeholder="Titre (ex: T-shirt Logo)"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-xl mb-3"
                    />

                    {/* Sous-titre */}
                    <input
                      type="text"
                      placeholder="Sous-titre (ex: Impression numérique)"
                      value={editingItem.subtitle}
                      onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-xl mb-4"
                    />

                    {/* Boutons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="flex-1 py-2 bg-white/10 text-white rounded-xl"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => saveItem(editingItem)}
                        disabled={isUploading || !editingItem.title || !editingItem.image_url}
                        className="flex-1 py-2 bg-accent text-black font-bold rounded-xl disabled:opacity-50"
                      >
                        {isUploading ? 'Envoi...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
