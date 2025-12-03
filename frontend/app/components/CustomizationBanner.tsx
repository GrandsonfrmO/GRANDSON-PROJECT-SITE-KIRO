'use client';

import { useIsMobile } from '../hooks/useIsMobile';
import { useInteractiveButton } from '../hooks/useHapticFeedback';

export default function CustomizationBanner() {
  const isMobile = useIsMobile();
  const { handlePress } = useInteractiveButton();

  const whatsappLink = `https://wa.me/224662662958`;

  const prices = [
    { icon: '👕', name: 'T-shirts', price: '80-120K', gradient: 'from-blue-500/20 to-blue-600/20' },
    { icon: '🎸', name: 'Bootleg', price: '120K', gradient: 'from-purple-500/20 to-purple-600/20' },
    { icon: '🧥', name: 'Pulls', price: '180-220K', gradient: 'from-orange-500/20 to-orange-600/20' },
    { icon: '🏃', name: 'Survêt.', price: '280-350K', gradient: 'from-red-500/20 to-red-600/20' },
    { icon: '🧢', name: 'Access.', price: '80K', gradient: 'from-green-500/20 to-green-600/20' },
  ];

  return (
    <div className={`relative bg-gradient-to-r from-black via-neutral-900 to-black text-white overflow-hidden ${isMobile ? 'py-6' : 'py-8'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-green-500/10"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto mobile-px">
        <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          
          {/* Header Section */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="relative">
                <span className={`${isMobile ? 'text-3xl' : 'text-4xl'} animate-bounce`}>🎨</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping"></span>
              </div>
              <h2 className={`font-black uppercase bg-gradient-to-r from-accent via-green-400 to-accent bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                Personnalisation Premium
              </h2>
              <div className="relative">
                <span className={`${isMobile ? 'text-3xl' : 'text-4xl'} animate-bounce delay-500`}>✨</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping delay-500"></span>
              </div>
            </div>
            <p className={`text-neutral-400 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Créez des pièces uniques • Délai 2-3 jours • Qualité garantie
            </p>
          </div>

          {/* Pricing Cards */}
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
            {prices.map((item, i) => (
              <div
                key={i}
                className={`group relative bg-gradient-to-br ${item.gradient} backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 ${
                  isMobile 
                    ? 'p-3 active:scale-95' 
                    : 'p-4 hover:scale-105 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20'
                }`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative text-center">
                  <div className={`${isMobile ? 'text-2xl mb-1' : 'text-3xl mb-2'} transition-transform duration-300 group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <div className={`font-bold text-white/90 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {item.name}
                  </div>
                  <div className={`font-black bg-gradient-to-r from-accent to-green-400 bg-clip-text text-transparent ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {item.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className={`flex items-center justify-center gap-3 ${isMobile ? 'flex-col' : ''}`}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              {...(isMobile ? handlePress(() => {}, 'medium') : {})}
              className={`group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg overflow-hidden ${
                isMobile 
                  ? 'px-6 py-3 text-sm w-full active:scale-95' 
                  : 'px-8 py-3 text-base hover:from-green-500 hover:to-green-400 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <svg className={`relative z-10 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} group-hover:rotate-12 transition-transform`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="relative z-10">Commander sur WhatsApp</span>
            </a>
            
            <a
              href="/personnalisation"
              className={`group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold transition-all duration-300 border border-white/20 hover:border-accent/50 ${
                isMobile 
                  ? 'px-6 py-3 text-sm w-full justify-center active:scale-95' 
                  : 'px-6 py-3 text-base hover:scale-105'
              }`}
            >
              <span>Voir Plus de Détails</span>
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:translate-x-1 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className={`flex items-center justify-center gap-4 text-neutral-400 ${isMobile ? 'text-xs flex-wrap' : 'text-sm'}`}>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Qualité Pro</span>
            </div>
            <span className="text-neutral-600">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Livraison Rapide</span>
            </div>
            <span className="text-neutral-600">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>100% Satisfait</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
