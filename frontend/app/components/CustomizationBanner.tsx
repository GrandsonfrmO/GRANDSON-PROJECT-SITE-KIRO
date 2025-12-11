'use client';

import { useIsMobile } from '../hooks/useIsMobile';
import { useInteractiveButton } from '../hooks/useHapticFeedback';

export default function CustomizationBanner() {
  const isMobile = useIsMobile();
  const { handlePress } = useInteractiveButton();

  const whatsappLink = `https://wa.me/224662662958`;

  const products = [
    { 
      icon: '👕', 
      name: 'T-shirts', 
      price: '80-120K',
      description: 'Coton premium',
      color: 'from-blue-500 to-blue-600',
      lightColor: 'from-blue-500/20 to-blue-600/20'
    },
    { 
      icon: '🎸', 
      name: 'Bootleg', 
      price: '120K',
      description: 'Édition limitée',
      color: 'from-purple-500 to-purple-600',
      lightColor: 'from-purple-500/20 to-purple-600/20'
    },
    { 
      icon: '🧥', 
      name: 'Pulls', 
      price: '180-220K',
      description: 'Tricot premium',
      color: 'from-orange-500 to-orange-600',
      lightColor: 'from-orange-500/20 to-orange-600/20'
    },
    { 
      icon: '🏃', 
      name: 'Survêtements', 
      price: '280-350K',
      description: 'Confort & style',
      color: 'from-red-500 to-red-600',
      lightColor: 'from-red-500/20 to-red-600/20'
    },
    { 
      icon: '🧢', 
      name: 'Accessoires', 
      price: '80K+',
      description: 'Finitions premium',
      color: 'from-green-500 to-green-600',
      lightColor: 'from-green-500/20 to-green-600/20'
    },
  ];

  return (
    <div className={`relative bg-gradient-to-b from-black via-neutral-900 to-black text-white overflow-hidden ${isMobile ? 'py-8' : 'py-16'}`}>
      {/* Premium Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-green-500/5"></div>
        
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
      </div>

      <div className="relative container mx-auto mobile-px">
        <div className={`${isMobile ? 'space-y-6' : 'space-y-10'}`}>
          
          {/* Premium Header Section */}
          <div className="text-center space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/40 rounded-full px-6 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-accent font-bold text-sm uppercase tracking-wider">Créations Exclusives</span>
            </div>

            {/* Main Title */}
            <div className="space-y-2">
              <h2 className={`font-black uppercase bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent leading-tight ${
                isMobile ? 'text-3xl' : 'text-5xl md:text-6xl'
              }`}>
                Personnalisation Premium
              </h2>
              <p className={`text-neutral-400 font-medium max-w-2xl mx-auto ${
                isMobile ? 'text-sm' : 'text-lg'
              }`}>
                Transformez vos idées en pièces uniques avec notre service de customisation haut de gamme
              </p>
            </div>

            {/* Highlights */}
            <div className={`flex items-center justify-center gap-6 flex-wrap ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <div className="flex items-center gap-2 text-accent">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Délai 2-3 jours</span>
              </div>
              <div className="w-1 h-1 bg-neutral-600 rounded-full"></div>
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Qualité Garantie</span>
              </div>
              <div className="w-1 h-1 bg-neutral-600 rounded-full"></div>
              <div className="flex items-center gap-2 text-purple-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Designs Uniques</span>
              </div>
            </div>
          </div>

          {/* Premium Product Cards */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
            {products.map((item, i) => (
              <div
                key={i}
                className={`group relative bg-gradient-to-br ${item.lightColor} backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 ${
                  isMobile 
                    ? 'p-4 active:scale-95' 
                    : 'p-6 hover:scale-110 hover:border-white/30 hover:shadow-2xl hover:shadow-accent/30'
                }`}
              >
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent via-transparent to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
                  <div className="absolute inset-[1px] bg-gradient-to-br from-black/80 to-black/60 rounded-2xl"></div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <div className="relative text-center space-y-3">
                  {/* Icon */}
                  <div className={`transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 ${
                    isMobile ? 'text-4xl' : 'text-5xl'
                  }`}>
                    {item.icon}
                  </div>
                  
                  {/* Name */}
                  <div>
                    <h3 className={`font-black text-white mb-1 ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-white/60 font-medium ${
                      isMobile ? 'text-xs' : 'text-xs'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className={`pt-2 border-t border-white/10 group-hover:border-accent/50 transition-colors`}>
                    <div className={`font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent ${
                      isMobile ? 'text-base' : 'text-lg'
                    }`}>
                      {item.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Premium CTA Section */}
          <div className={`flex items-center justify-center gap-4 ${isMobile ? 'flex-col' : ''}`}>
            {/* Primary CTA - WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              {...(isMobile ? handlePress(() => {}, 'medium') : {})}
              className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white rounded-2xl font-bold transition-all duration-500 shadow-2xl overflow-hidden border border-green-400/30 ${
                isMobile 
                  ? 'px-8 py-4 text-base w-full active:scale-95' 
                  : 'px-10 py-4 text-lg hover:from-green-500 hover:via-green-400 hover:to-emerald-400 hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 hover:border-green-300/60'
              }`}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <svg className={`relative z-10 ${isMobile ? 'w-6 h-6' : 'w-7 h-7'} group-hover:scale-110 transition-transform`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="relative z-10">Commander sur WhatsApp</span>
            </a>
            
            {/* Secondary CTA - Details */}
            <a
              href="/personnalisation"
              className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 backdrop-blur-xl text-white rounded-2xl font-bold transition-all duration-500 border border-white/20 hover:border-accent/60 ${
                isMobile 
                  ? 'px-8 py-4 text-base w-full active:scale-95' 
                  : 'px-10 py-4 text-lg hover:scale-105 hover:shadow-xl hover:shadow-accent/20'
              }`}
            >
              <span className="relative z-10">Voir Tous les Détails</span>
              <svg className={`relative z-10 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} group-hover:translate-x-2 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Premium Trust Indicators */}
          <div className={`flex items-center justify-center gap-6 flex-wrap ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <div className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent/50 transition-all">
              <div className="relative">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/80 group-hover:text-white transition-colors">Qualité Premium</span>
            </div>
            
            <div className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/50 transition-all">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80 group-hover:text-white transition-colors">Délai 2-3 jours</span>
            </div>
            
            <div className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80 group-hover:text-white transition-colors">100% Satisfait</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
