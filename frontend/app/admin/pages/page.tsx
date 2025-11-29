'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '../../components/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';

interface PageContent {
  id: string;
  pageKey: string;
  title: string;
  subtitle: string | null;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PagesManagement() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/pages', true);
      setPages(response.data?.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = (page: PageContent) => {
    setEditingPage(page);
    try {
      const parsed = JSON.parse(page.content);
      setParsedContent(parsed);
    } catch (error) {
      console.error('Error parsing content:', error);
      setParsedContent({});
    }
    setShowForm(true);
  };

  const handleToggleStatus = async (pageKey: string) => {
    try {
      const response = await api.put(`/api/admin/pages/${pageKey}/toggle`, {}, true);
      if (response.success) {
        fetchPages();
      }
    } catch (error) {
      console.error('Error toggling page status:', error);
    }
  };

  const getPageIcon = (pageKey: string) => {
    switch (pageKey) {
      case 'starter-pack':
        return '📦';
      case 'download':
        return '💾';
      case 'contact':
        return '📞';
      default:
        return '📄';
    }
  };

  const getPageName = (pageKey: string) => {
    switch (pageKey) {
      case 'starter-pack':
        return 'Starter Pack';
      case 'download':
        return 'Download';
      case 'contact':
        return 'Contact';
      default:
        return pageKey;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    try {
      const contentString = JSON.stringify(parsedContent);
      await api.post(
        '/api/admin/pages',
        {
          pageKey: editingPage.pageKey,
          title: editingPage.title,
          subtitle: editingPage.subtitle,
          content: contentString,
          isActive: editingPage.isActive,
        },
        true
      );
      setShowForm(false);
      setEditingPage(null);
      setParsedContent(null);
      fetchPages();
      alert('Page mise à jour avec succès !');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const updateContentField = (path: string, value: any) => {
    const keys = path.split('.');
    const newContent = { ...parsedContent };
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setParsedContent(newContent);
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Chargement...</div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (showForm && editingPage) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-black text-white uppercase">
                Modifier {getPageName(editingPage.pageKey)}
              </h1>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPage(null);
                  setParsedContent(null);
                }}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Retour
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Titre */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <label className="block text-sm font-bold text-neutral-400 mb-2">
                  Titre de la Page *
                </label>
                <input
                  type="text"
                  value={editingPage.title || ''}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, title: e.target.value })
                  }
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                />
              </div>

              {/* Sous-titre */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <label className="block text-sm font-bold text-neutral-400 mb-2">
                  Sous-titre
                </label>
                <textarea
                  value={editingPage.subtitle || ''}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, subtitle: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                />
              </div>

              {/* Champs spécifiques selon le type de page */}
              {editingPage.pageKey === 'starter-pack' && parsedContent && (
                <>
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Informations du Pack</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Prix (GNF) *
                        </label>
                        <input
                          type="number"
                          value={parsedContent.price || ''}
                          onChange={(e) => updateContentField('price', parseInt(e.target.value))}
                          required
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Description
                        </label>
                        <textarea
                          value={parsedContent.description || ''}
                          onChange={(e) => updateContentField('description', e.target.value)}
                          rows={3}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {editingPage.pageKey === 'contact' && parsedContent && parsedContent.mainContact && (
                <>
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Coordonnées Principales</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          value={parsedContent.mainContact.phone || ''}
                          onChange={(e) => updateContentField('mainContact.phone', e.target.value)}
                          required
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          WhatsApp *
                        </label>
                        <input
                          type="tel"
                          value={parsedContent.mainContact.whatsapp || ''}
                          onChange={(e) => updateContentField('mainContact.whatsapp', e.target.value)}
                          required
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={parsedContent.mainContact.email || ''}
                          onChange={(e) => updateContentField('mainContact.email', e.target.value)}
                          required
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          value={parsedContent.mainContact.address || ''}
                          onChange={(e) => updateContentField('mainContact.address', e.target.value)}
                          required
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Horaires *
                        </label>
                        <input
                          type="text"
                          value={parsedContent.mainContact.hours || ''}
                          onChange={(e) => updateContentField('mainContact.hours', e.target.value)}
                          required
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-400 mb-2">
                          Temps de réponse
                        </label>
                        <input
                          type="text"
                          value={parsedContent.mainContact.responseTime || ''}
                          onChange={(e) => updateContentField('mainContact.responseTime', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Introduction</h3>
                    <textarea
                      value={parsedContent.intro || ''}
                      onChange={(e) => updateContentField('intro', e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                    />
                  </div>
                </>
              )}

              {editingPage.pageKey === 'download' && parsedContent && (
                <>
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Introduction</h3>
                    <textarea
                      value={parsedContent.intro || ''}
                      onChange={(e) => updateContentField('intro', e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                      placeholder="Texte d'introduction de la page"
                    />
                  </div>

                  {/* Catégories et Outils */}
                  {parsedContent.categories && parsedContent.categories.map((category: any, catIndex: number) => (
                    <div key={catIndex} className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">
                          Catégorie {catIndex + 1}: {category.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = [...parsedContent.categories];
                            newCategories.splice(catIndex, 1);
                            updateContentField('categories', newCategories);
                          }}
                          className="text-red-400 hover:text-red-300 text-sm font-bold"
                        >
                          Supprimer catégorie
                        </button>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-bold text-neutral-400 mb-2">
                            Nom de la catégorie *
                          </label>
                          <input
                            type="text"
                            value={category.name || ''}
                            onChange={(e) => {
                              const newCategories = [...parsedContent.categories];
                              newCategories[catIndex].name = e.target.value;
                              updateContentField('categories', newCategories);
                            }}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                            placeholder="Ex: Design Graphique"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-neutral-400 mb-2">
                            Description de la catégorie
                          </label>
                          <textarea
                            value={category.description || ''}
                            onChange={(e) => {
                              const newCategories = [...parsedContent.categories];
                              newCategories[catIndex].description = e.target.value;
                              updateContentField('categories', newCategories);
                            }}
                            rows={2}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none"
                            placeholder="Description de la catégorie"
                          />
                        </div>
                      </div>

                      {/* Outils de cette catégorie */}
                      <div className="space-y-4">
                        <h4 className="text-md font-bold text-accent">Outils ({category.tools?.length || 0})</h4>
                        
                        {category.tools && category.tools.map((tool: any, toolIndex: number) => (
                          <div key={toolIndex} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-bold">Outil {toolIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCategories = [...parsedContent.categories];
                                  newCategories[catIndex].tools.splice(toolIndex, 1);
                                  updateContentField('categories', newCategories);
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Supprimer
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">
                                  Nom *
                                </label>
                                <input
                                  type="text"
                                  value={tool.name || ''}
                                  onChange={(e) => {
                                    const newCategories = [...parsedContent.categories];
                                    newCategories[catIndex].tools[toolIndex].name = e.target.value;
                                    updateContentField('categories', newCategories);
                                  }}
                                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                                  placeholder="Adobe Photoshop"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">
                                  Icône (emoji)
                                </label>
                                <input
                                  type="text"
                                  value={tool.icon || ''}
                                  onChange={(e) => {
                                    const newCategories = [...parsedContent.categories];
                                    newCategories[catIndex].tools[toolIndex].icon = e.target.value;
                                    updateContentField('categories', newCategories);
                                  }}
                                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                                  placeholder="🎨"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">
                                  Type
                                </label>
                                <select
                                  value={tool.type || 'Gratuit'}
                                  onChange={(e) => {
                                    const newCategories = [...parsedContent.categories];
                                    newCategories[catIndex].tools[toolIndex].type = e.target.value;
                                    updateContentField('categories', newCategories);
                                  }}
                                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                                >
                                  <option value="Gratuit">Gratuit</option>
                                  <option value="Payant">Payant</option>
                                  <option value="Freemium">Freemium</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">
                                  Prix
                                </label>
                                <input
                                  type="text"
                                  value={tool.price || ''}
                                  onChange={(e) => {
                                    const newCategories = [...parsedContent.categories];
                                    newCategories[catIndex].tools[toolIndex].price = e.target.value;
                                    updateContentField('categories', newCategories);
                                  }}
                                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                                  placeholder="Gratuit ou 23,99€/mois"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-neutral-500 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={tool.description || ''}
                                  onChange={(e) => {
                                    const newCategories = [...parsedContent.categories];
                                    newCategories[catIndex].tools[toolIndex].description = e.target.value;
                                    updateContentField('categories', newCategories);
                                  }}
                                  rows={2}
                                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                                  placeholder="Description de l'outil"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-neutral-500 mb-1">
                                  Lien
                                </label>
                                <input
                                  type="url"
                                  value={tool.link || ''}
                                  onChange={(e) => {
                                    const newCategories = [...parsedContent.categories];
                                    newCategories[catIndex].tools[toolIndex].link = e.target.value;
                                    updateContentField('categories', newCategories);
                                  }}
                                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = [...parsedContent.categories];
                            if (!newCategories[catIndex].tools) {
                              newCategories[catIndex].tools = [];
                            }
                            newCategories[catIndex].tools.push({
                              id: Date.now(),
                              name: '',
                              description: '',
                              icon: '🔧',
                              type: 'Gratuit',
                              link: '',
                              price: 'Gratuit',
                            });
                            updateContentField('categories', newCategories);
                          }}
                          className="w-full bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
                        >
                          + Ajouter un outil
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const newCategories = parsedContent.categories || [];
                      newCategories.push({
                        name: 'Nouvelle catégorie',
                        description: '',
                        tools: [],
                      });
                      updateContentField('categories', newCategories);
                    }}
                    className="w-full bg-accent hover:bg-accent/80 text-black px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    + Ajouter une catégorie
                  </button>

                  {/* Guides */}
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Guides Téléchargeables</h3>
                    
                    {parsedContent.guides && parsedContent.guides.map((guide: unknown, guideIndex: number) => (
                      <div key={guideIndex} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-bold">Guide {guideIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newGuides = [...parsedContent.guides];
                              newGuides.splice(guideIndex, 1);
                              updateContentField('guides', newGuides);
                            }}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Supprimer
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">
                              Titre du guide *
                            </label>
                            <input
                              type="text"
                              value={(guide as any).title || ''}
                              onChange={(e) => {
                                const newGuides = [...parsedContent.guides];
                                (newGuides[guideIndex] as any).title = e.target.value;
                                updateContentField('guides', newGuides);
                              }}
                              className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                              placeholder="Guide du débutant"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">
                              Description
                            </label>
                            <textarea
                              value={(guide as any).description || ''}
                              onChange={(e) => {
                                const newGuides = [...parsedContent.guides];
                                (newGuides[guideIndex] as any).description = e.target.value;
                                updateContentField('guides', newGuides);
                              }}
                              rows={2}
                              className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                              placeholder="Description du guide"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">
                              Lien de téléchargement
                            </label>
                            <input
                              type="url"
                              value={(guide as any).downloadLink || ''}
                              onChange={(e) => {
                                const newGuides = [...parsedContent.guides];
                                (newGuides[guideIndex] as any).downloadLink = e.target.value;
                                updateContentField('guides', newGuides);
                              }}
                              className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                              placeholder="https://... ou #"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const newGuides = parsedContent.guides || [];
                        newGuides.push({
                          title: '',
                          description: '',
                          downloadLink: '#',
                        });
                        updateContentField('guides', newGuides);
                      }}
                      className="w-full bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
                    >
                      + Ajouter un guide
                    </button>
                  </div>
                </>
              )}

              {/* Statut actif */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.isActive || false}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent focus:ring-offset-0"
                  />
                  <span className="ml-3 text-white font-bold">
                    Page active (visible sur le site)
                  </span>
                </label>
              </div>

              {/* Bouton JSON avancé */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <details>
                  <summary className="text-white font-bold cursor-pointer hover:text-accent">
                    Mode avancé (Édition JSON complète)
                  </summary>
                  <div className="mt-4">
                    <textarea
                      value={JSON.stringify(parsedContent, null, 2)}
                      onChange={(e) => {
                        try {
                          setParsedContent(JSON.parse(e.target.value));
                        } catch (err) {
                          // Ignore parsing errors while typing
                        }
                      }}
                      rows={15}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                </details>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/80 text-black px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPage(null);
                    setParsedContent(null);
                  }}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black text-white uppercase">
              Gestion des Pages
            </h1>
          </div>

          {pages.length === 0 ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-12 text-center">
              <p className="text-neutral-400 text-lg mb-4">
                Aucune page trouvée
              </p>
              <p className="text-neutral-500 text-sm">
                Les pages seront créées automatiquement
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{getPageIcon(page.pageKey)}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      page.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {page.isActive ? 'Actif' : 'Inactif'}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {getPageName(page.pageKey)}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-4">
                    {page.title}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(page)}
                      className="flex-1 bg-accent hover:bg-accent/80 text-black px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleStatus(page.pageKey)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        page.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {page.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
