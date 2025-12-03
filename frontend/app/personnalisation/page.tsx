'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import Layout from '../components/Layout';
import ParticleBackground from '../components/ParticleBackground';

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
}

export default function PersonnalisationPage() {
  const isMobile = useIsMobile();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const whatsappNumber = '+224 662 66 29 58';
  const whatsappLink = `https://wa.me/224662662958`;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/admin/customization-gallery');
        const data = await response.json();
        if (data.success && data.data?.items) {
          setGalleryItems(data.data.items);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      }
    };
    fetchGallery();
  }, []);

  return (
    <Layout>
      {/* Hero Section - Enhanced */}
      <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white overflow-hidden ${
        isMobile ? 'py-12' : 'py-20'
      }`}>
        <ParticleBackground />
        
        <div className="absolute inset-0">
          <div className="absolute top-10 left-5 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-5 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-accent/5 to-transparent rounded-full"></div>
        </div>

        <div className="relative container mx-auto mobile-px">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 rounded-full px-6 py-2 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              <span className={`text-accent font-bold uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Service Premium
              </span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500"></span>
            </div>

            {/* Icons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <span className={`${isMobile ? 'text-4xl' : 'text-6xl'} animate-bounce`}>🎨</span>
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-ping"></span>
              </div>
              <span className={`${isMobile ? 'text-4xl' : 'text-6xl'} animate-bounce delay-300`}>✨</span>
              <div className="relative">
                <span className={`${isMobile ? 'text-4xl' : 'text-6xl'} animate-bounce delay-500`}>🎁</span>
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping delay-500"></span>
              </div>
            </div>
            
            {/* Title */}
            <h1 className={`font-black uppercase leading-tight mb-4 ${
              isMobile ? 'text-4xl' : 'text-6xl md:text-7xl'
            }`}>
              <span className="bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent animate-gradient">
                Personnalisation
              </span>
              <span className="block text-accent mt-2">Premium</span>
            </h1>
            
            {/* Description */}
            <p className={`text-neutral-300 max-w-2xl mx-auto leading-relaxed mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
              Transformez vos idées en réalité avec notre service de personnalisation haut de gamme. 
              Qualité professionnelle garantie.
            </p>

            {/* Features */}
            <div className={`flex items-center justify-center gap-6 flex-wrap ${isMobile ? 'text-sm' : 'text-base'}`}>
              <div className="flex items-center gap-2 text-neutral-400">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Délai 2-3 jours</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Qualité Pro</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Express 24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`container mx-auto mobile-px ${isMobile ? 'py-8' : 'py-16'}`}>
        
        {/* Contact Section - Compact */}
        <div className={`relative bg-gradient-to-r from-green-600 to-green-500 rounded-2xl overflow-hidden shadow-lg ${
          isMobile ? 'mb-6 p-4' : 'mb-10 p-6'
        }`}>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-white">
            <span className="text-2xl">📱</span>
            <span className={`font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>WhatsApp:</span>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-white text-green-600 rounded-xl font-black transition-all hover:scale-105 active:scale-95 ${
                isMobile ? 'text-lg px-4 py-2' : 'text-xl px-6 py-2'
              }`}
            >
              {whatsappNumber}
            </a>
          </div>
        </div>

        {/* Services Overview - Enhanced */}
        <div className={`${isMobile ? 'mb-10' : 'mb-16'}`}>
          <div className="text-center mb-8">
            <h2 className={`font-black text-neutral-900 mb-3 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
              Nos Services
            </h2>
            <p className={`text-neutral-600 max-w-2xl mx-auto ${isMobile ? 'text-sm' : 'text-lg'}`}>
              Des solutions complètes pour tous vos besoins de personnalisation
            </p>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`block mb-3 transition-transform duration-300 group-hover:scale-110 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🖨️</span>
              <h3 className={`font-black text-neutral-900 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>Impression</h3>
              <p className={`text-neutral-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Haute qualité</p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`block mb-3 transition-transform duration-300 group-hover:scale-110 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🎸</span>
              <h3 className={`font-black text-neutral-900 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>Bootleg</h3>
              <p className={`text-neutral-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Style vintage</p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`block mb-3 transition-transform duration-300 group-hover:scale-110 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🎁</span>
              <h3 className={`font-black text-neutral-900 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>Cadeaux</h3>
              <p className={`text-neutral-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Personnalisés</p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`block mb-3 transition-transform duration-300 group-hover:scale-110 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🎨</span>
              <h3 className={`font-black text-neutral-900 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>Design</h3>
              <p className={`text-neutral-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Sur mesure</p>
            </div>
          </div>
        </div>

        {/* Pricing Section - Enhanced */}
        <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-black rounded-3xl overflow-hidden ${
          isMobile ? 'p-6 mb-10' : 'p-10 mb-16'
        }`}>
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 rounded-full px-6 py-2 mb-4">
                <span className="text-2xl">💰</span>
                <span className={`text-accent font-bold uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Tarifs Transparents
                </span>
              </div>
              <h2 className={`font-black text-white mb-3 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Prix Compétitifs
              </h2>
              <p className={`text-neutral-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Qualité premium à prix abordable
              </p>
            </div>

            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {/* T-shirts */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} transition-transform duration-300 group-hover:scale-110`}>👕</span>
                    <span className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>T-shirts</span>
                  </div>
                  <p className={`text-accent font-black ${isMobile ? 'text-lg' : 'text-2xl'}`}>80-120K</p>
                  <p className={`text-neutral-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>GNF</p>
                </div>
              </div>

              {/* Bootleg */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} transition-transform duration-300 group-hover:scale-110`}>🎸</span>
                    <span className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Bootleg</span>
                  </div>
                  <p className={`text-green-400 font-black ${isMobile ? 'text-lg' : 'text-2xl'}`}>120-150K</p>
                  <p className={`text-neutral-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>GNF</p>
                </div>
              </div>

              {/* Pulls */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} transition-transform duration-300 group-hover:scale-110`}>🧥</span>
                    <span className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Pulls</span>
                  </div>
                  <p className={`text-accent font-black ${isMobile ? 'text-lg' : 'text-2xl'}`}>180-220K</p>
                  <p className={`text-neutral-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>GNF</p>
                </div>
              </div>

              {/* Survêtements */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} transition-transform duration-300 group-hover:scale-110`}>🏃</span>
                    <span className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Survêtements</span>
                  </div>
                  <p className={`text-green-400 font-black ${isMobile ? 'text-lg' : 'text-2xl'}`}>280-350K</p>
                  <p className={`text-neutral-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>GNF</p>
                </div>
              </div>

              {/* Accessoires */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} transition-transform duration-300 group-hover:scale-110`}>🧢</span>
                    <span className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Accessoires</span>
                  </div>
                  <p className={`text-accent font-black ${isMobile ? 'text-lg' : 'text-2xl'}`}>80K+</p>
                  <p className={`text-neutral-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>GNF</p>
                </div>
              </div>

              {/* Délai */}
              <div className="group relative bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-400/30 transition-all duration-300 hover:scale-105 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-400/30">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center">
                  <span className={`block mb-2 ${isMobile ? 'text-3xl' : 'text-4xl'} transition-transform duration-300 group-hover:scale-110`}>⏱️</span>
                  <p className={`text-green-400 font-black mb-1 ${isMobile ? 'text-lg' : 'text-2xl'}`}>2-3 jours</p>
                  <p className={`text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Délai standard</p>
                </div>
              </div>
            </div>

            {/* Express Option */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-3 backdrop-blur-sm">
                <span className="text-xl">⚡</span>
                <span className={`text-yellow-400 font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Service Express 24h disponible (+50%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section - Compact */}
        <div className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
          <h2 className={`font-black text-neutral-900 text-center mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Comment Ça Marche ?
          </h2>

          <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div className="bg-accent/10 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">💬</span>
              <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">1</span>
              <p className={`font-bold text-neutral-900 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Contact</p>
            </div>
            <div className="bg-neutral-100 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">🎨</span>
              <span className="bg-neutral-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</span>
              <p className={`font-bold text-neutral-900 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Design</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">✅</span>
              <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              <p className={`font-bold text-neutral-900 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Validation</p>
            </div>
            <div className="bg-neutral-100 rounded-xl p-3 text-center">
              <span className="text-xl block mb-1">🚚</span>
              <span className="bg-neutral-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">4</span>
              <p className={`font-bold text-neutral-900 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Livraison</p>
            </div>
          </div>
        </div>

        {/* Gallery Section - Compact */}
        {galleryItems.length > 0 && (
        <div className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
          <h2 className={`font-black text-neutral-900 text-center mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            📸 Nos Réalisations
          </h2>

          <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-4 lg:grid-cols-6'}`}>
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative aspect-square bg-neutral-200 rounded-xl overflow-hidden">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className={`text-white font-bold ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* FAQ Section - Compact */}
        <div className={`bg-neutral-50 rounded-2xl ${isMobile ? 'p-4 mb-8' : 'p-6 mb-12'}`}>
          <h2 className={`font-black text-neutral-900 text-center mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            ❓ FAQ
          </h2>

          <div className={`space-y-2 ${isMobile ? '' : 'max-w-3xl mx-auto'}`}>
            <details className="bg-white rounded-xl p-3 border border-neutral-200">
              <summary className={`font-bold text-neutral-900 cursor-pointer ${isMobile ? 'text-sm' : 'text-base'}`}>
                Quels types de designs acceptez-vous ?
              </summary>
              <p className={`text-neutral-600 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Logos, textes, photos, illustrations en PNG, JPG, PDF ou AI. Nous pouvons aussi créer pour vous !
              </p>
            </details>

            <details className="bg-white rounded-xl p-3 border border-neutral-200">
              <summary className={`font-bold text-neutral-900 cursor-pointer ${isMobile ? 'text-sm' : 'text-base'}`}>
                Quantité minimum de commande ?
              </summary>
              <p className={`text-neutral-600 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Non ! À partir d'1 pièce. Tarifs dégressifs pour 10+ pièces.
              </p>
            </details>

            <details className="bg-white rounded-xl p-3 border border-neutral-200">
              <summary className={`font-bold text-neutral-900 cursor-pointer ${isMobile ? 'text-sm' : 'text-base'}`}>
                Service express disponible ?
              </summary>
              <p className={`text-neutral-600 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Oui ! Express 24h avec supplément de 50%.
              </p>
            </details>

            <details className="bg-white rounded-xl p-3 border border-neutral-200">
              <summary className={`font-bold text-neutral-900 cursor-pointer ${isMobile ? 'text-sm' : 'text-base'}`}>
                Comment entretenir mes articles ?
              </summary>
              <p className={`text-neutral-600 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Lavage 30°C à l'envers, pas de sèche-linge, repassage basse température.
              </p>
            </details>
          </div>
        </div>

        {/* Final CTA - Compact */}
        <div className={`bg-gradient-to-r from-black to-neutral-900 rounded-2xl text-center ${isMobile ? 'p-4' : 'p-6'}`}>
          <p className={`text-white font-bold mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
            🚀 Prêt à créer ?
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 bg-green-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 ${
              isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-3 text-base'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </Layout>
  );
}
