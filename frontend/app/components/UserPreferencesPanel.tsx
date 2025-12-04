'use client';

import { useState } from 'react';
import { useUserPreferences } from '../lib/userPreferences';

export default function UserPreferencesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-neutral-900 hover:bg-black text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
        aria-label="Paramètres"
        title="Paramètres d'affichage"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-neutral-900 to-black text-white p-6 shadow-lg z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Préférences</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/70 text-sm mt-2">
                Personnalisez votre expérience d'achat
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* View Mode */}
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Mode d'affichage
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updatePreference('viewMode', 'grid')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.viewMode === 'grid'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-sm font-semibold">Grille</span>
                  </button>
                  <button
                    onClick={() => updatePreference('viewMode', 'list')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.viewMode === 'list'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-sm font-semibold">Liste</span>
                  </button>
                </div>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Produits par page
                </label>
                <select
                  value={preferences.itemsPerPage}
                  onChange={(e) => updatePreference('itemsPerPage', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value={8}>8 produits</option>
                  <option value={12}>12 produits</option>
                  <option value={24}>24 produits</option>
                  <option value={48}>48 produits</option>
                </select>
              </div>

              {/* Default Sort */}
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Tri par défaut
                </label>
                <select
                  value={preferences.defaultSort}
                  onChange={(e) => updatePreference('defaultSort', e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="newest">Plus récents</option>
                  <option value="name">Nom A-Z</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>

              {/* Show Out of Stock */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.showOutOfStock}
                    onChange={(e) => updatePreference('showOutOfStock', e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-neutral-300 text-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-neutral-900">
                      Afficher les produits en rupture
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Voir les produits même s'ils ne sont pas disponibles
                    </div>
                  </div>
                </label>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Thème
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updatePreference('theme', theme)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        preferences.theme === theme
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {theme === 'light' && '☀️'}
                        {theme === 'dark' && '🌙'}
                        {theme === 'auto' && '🔄'}
                      </div>
                      <span className="text-xs font-semibold capitalize">
                        {theme === 'light' && 'Clair'}
                        {theme === 'dark' && 'Sombre'}
                        {theme === 'auto' && 'Auto'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Langue
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updatePreference('language', 'fr')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.language === 'fr'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🇫🇷</div>
                    <span className="text-sm font-semibold">Français</span>
                  </button>
                  <button
                    onClick={() => updatePreference('language', 'en')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.language === 'en'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🇬🇧</div>
                    <span className="text-sm font-semibold">English</span>
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-6 border-t border-neutral-200">
                <button
                  onClick={() => {
                    if (confirm('Réinitialiser toutes les préférences ?')) {
                      resetPreferences();
                    }
                  }}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réinitialiser les préférences
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
