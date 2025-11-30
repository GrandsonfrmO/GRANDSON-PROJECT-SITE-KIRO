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
      {/* Hero Section - Compact */}
      <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white overflow-hidden ${
        isMobile ? 'py-8' : 'py-12'
      }`}>
        <ParticleBackground />
        
        <div className="absolute inset-0">
          <div className="absolute top-10 left-5 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-5 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto mobile-px">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className={`${isMobile ? 'text-3xl' : 'text-4xl'}`}>🎨</span>
              <span className={`${isMobile ? 'text-3xl' : 'text-4xl'}`}>✨</span>
            </div>
            
            <h1 className={`font-black uppercase bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent mb-2 ${
              isMobile ? 'text-2xl' : 'text-4xl'
            }`}>
              Personnalisation
            </h1>
            
            <p className={`text-neutral-300 max-w-xl mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
              Créez des pièces uniques • Délai 2-3 jours
            </p>
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

        {/* Services Overview - Compact */}
        <div className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
          <h2 className={`font-black text-neutral-900 text-center mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Nos Services
          </h2>

          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div className="bg-white rounded-xl p-3 border border-neutral-200 text-center">
              <span className="text-2xl block mb-1">🖨️</span>
              <h3 className={`font-bold text-neutral-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Impression</h3>
            </div>
            <div className="bg-white rounded-xl p-3 border border-neutral-200 text-center">
              <span className="text-2xl block mb-1">🎸</span>
              <h3 className={`font-bold text-neutral-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Bootleg</h3>
            </div>
            <div className="bg-white rounded-xl p-3 border border-neutral-200 text-center">
              <span className="text-2xl block mb-1">🎁</span>
              <h3 className={`font-bold text-neutral-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Cadeaux</h3>
            </div>
            <div className="bg-white rounded-xl p-3 border border-neutral-200 text-center">
              <span className="text-2xl block mb-1">🎨</span>
              <h3 className={`font-bold text-neutral-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Design</h3>
            </div>
          </div>
        </div>

        {/* Pricing Section - Compact */}
        <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-black rounded-2xl overflow-hidden ${
          isMobile ? 'p-4 mb-8' : 'p-6 mb-12'
        }`}>
          <div className="relative z-10">
            <h2 className={`font-black text-white text-center mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              💰 Tarifs
            </h2>

            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {/* T-shirts */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">👕</span>
                  <span className={`font-bold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>T-shirts</span>
                </div>
                <p className={`text-accent font-black ${isMobile ? 'text-sm' : 'text-base'}`}>80-120K</p>
              </div>

              {/* Bootleg */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎸</span>
                  <span className={`font-bold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>Bootleg</span>
                </div>
                <p className={`text-green-400 font-black ${isMobile ? 'text-sm' : 'text-base'}`}>120-150K</p>
              </div>

              {/* Pulls */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧥</span>
                  <span className={`font-bold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>Pulls</span>
                </div>
                <p className={`text-accent font-black ${isMobile ? 'text-sm' : 'text-base'}`}>180-220K</p>
              </div>

              {/* Survêtements */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🏃</span>
                  <span className={`font-bold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>Survêt.</span>
                </div>
                <p className={`text-green-400 font-black ${isMobile ? 'text-sm' : 'text-base'}`}>280-350K</p>
              </div>

              {/* Accessoires */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧢</span>
                  <span className={`font-bold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>Access.</span>
                </div>
                <p className={`text-accent font-black ${isMobile ? 'text-sm' : 'text-base'}`}>80K</p>
              </div>

              {/* Délai */}
              <div className="bg-green-500/20 rounded-xl p-3 text-center">
                <span className="text-xl block">⏱️</span>
                <p className={`text-green-400 font-black ${isMobile ? 'text-sm' : 'text-base'}`}>2-3 jours</p>
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
