'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '../../components/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import Toast from '../../components/Toast';

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/delivery-zones', true);
      setZones(response.data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setToast({ message: 'Erreur lors du chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      price: zone.price.toString(),
      isActive: zone.isActive,
    });
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/delivery-zones/${id}`, true);
      setZones(zones.filter((z) => z.id !== id));
      setDeleteConfirm(null);
      setToast({ message: 'Zone supprimée avec succès', type: 'success' });
    } catch (error) {
      console.error('Error deleting zone:', error);
      setToast({ message: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Le nom du quartier est requis');
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      setFormError('Le prix doit être un nombre positif');
      return;
    }

    try {
      setSaving(true);

      if (editingZone) {
        // Update
        const response = await api.put(
          `/api/admin/delivery-zones/${editingZone.id}`,
          formData,
          true
        );
        setZones(zones.map((z) => (z.id === editingZone.id ? response.data : z)));
        setToast({ message: 'Zone mise à jour avec succès', type: 'success' });
      } else {
        // Create
        const response = await api.post('/api/admin/delivery-zones', formData, true);
        setZones([...zones, response.data]);
        setToast({ message: 'Zone créée avec succès', type: 'success' });
      }

      // Reset form
      setShowForm(false);
      setEditingZone(null);
      setFormData({ name: '', price: '', isActive: true });
    } catch (error) {
      console.error('Error saving zone:', error);
      const err = error as Error;
      setFormError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingZone(null);
    setFormData({ name: '', price: '', isActive: true });
    setFormError('');
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white mb-2 uppercase">
                Zones de Livraison
              </h1>
              <p className="text-neutral-400">
                Gérez les quartiers et les prix de livraison
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-black font-black uppercase rounded-xl transition-all shadow-lg hover:shadow-accent/20"
              >
                + Ajouter une Zone
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-black text-white mb-6 uppercase">
                {editingZone ? 'Modifier la Zone' : 'Nouvelle Zone'}
              </h2>

              {formError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                  <p className="text-red-400 text-sm font-semibold">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-3 uppercase tracking-wide">
                      Nom du Quartier *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                      placeholder="Ex: Kaloum, Matam, Ratoma..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-3 uppercase tracking-wide">
                      Prix de Livraison (GNF) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                      placeholder="10000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-600 bg-neutral-900 text-accent focus:ring-2 focus:ring-accent"
                  />
                  <label htmlFor="isActive" className="text-neutral-300 font-semibold">
                    Zone active (visible pour les clients)
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-black font-black uppercase rounded-xl transition-all disabled:opacity-50 shadow-lg"
                  >
                    {saving ? 'Enregistrement...' : editingZone ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 bg-neutral-800/50 hover:bg-neutral-700/50 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Zones List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-neutral-800/50 rounded-xl p-6">
                  <div className="h-6 bg-neutral-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : zones.length === 0 ? (
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Aucune zone de livraison
              </h3>
              <p className="text-neutral-400 mb-6">
                Commencez par ajouter vos premières zones de livraison
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-black font-bold rounded-xl transition-all"
              >
                + Ajouter une Zone
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6 hover:border-accent/30 transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white mb-2">
                        {zone.name}
                      </h3>
                      <p className="text-accent font-black text-2xl">
                        {zone.price.toLocaleString()}
                        <span className="text-sm text-neutral-400 ml-1">GNF</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        zone.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {zone.isActive ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="flex-1 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-white text-sm font-bold rounded-lg transition-all"
                    >
                      ✏️ Modifier
                    </button>
                    {deleteConfirm === zone.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          ✓ Confirmer
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(zone.id)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm font-bold rounded-lg transition-all"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            id={Date.now().toString()}
            title={toast.type === 'success' ? 'Succès' : 'Erreur'}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}
