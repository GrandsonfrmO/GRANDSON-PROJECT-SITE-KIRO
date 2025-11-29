'use client';

import { useIsMobile } from '../hooks/useIsMobile';
import { useInteractiveButton } from '../hooks/useHapticFeedback';

export default function CustomizationBanner() {
  const isMobile = useIsMobile();
  const { handlePress } = useInteractiveButton();

  const whatsappNumber = '+224 662 66 29 58';
  const whatsappLink = `https://wa.me/224662662958`;

  return (
    <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-black text-white overflow-hidden ${
      isMobile ? 'py-8' : 'py-12'
    }`}>
      {/* Advanced Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/10 to-transparent rounded-full animate-spin-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 right-1/4 w-4 h-4 bg-accent rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-1/4 w-6 h-6 bg-green-400/60 rounded-full animate-float delay-500"></div>
        <div className="absolute top-40 left-1/3 w-3 h-3 bg-white/40 rounded-full animate-float delay-1000"></div>
      </div>

      <div className={`relative container mx-auto mobile-px ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
        {/* Premium Badge */}
        <div className="flex justify-center animate-fade-in-down">
          <div className={`inline-flex items-center bg-gradient-to-r from-accent/20 to-green-500/20 border-2 border-accent/50 rounded-full backdrop-blur-xl shadow-2xl transition-transform duration-300 ${
            isMobile 
              ? 'px-4 py-2 gap-2 active:scale-95' 
              : 'px-6 py-3 gap-3 hover:scale-105'
          }`}>
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span className={`text-accent font-black uppercase tracking-wider ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Service Premium
            </span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500"></span>
          </div>
        </div>

        {/* Header with icon - Enhanced */}
        <div className="text-center animate-fade-in-up delay-200">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} animate-bounce filter drop-shadow-2xl`}>🎨</div>
            <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} animate-bounce delay-300 filter drop-shadow-2xl`}>✨</div>
          </div>
          <h2 className={`font-black uppercase tracking-tight bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent mb-3 ${
            isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'
          }`}>
            Personnalisation
          </h2>
          <h3 className={`font-black uppercase tracking-tight text-white/90 ${
            isMobile ? 'text-xl' : 'text-2xl md:text-3xl'
          }`}>
            de vos articles
          </h3>
          <div className={`mt-4 text-neutral-300 font-semibold ${
            isMobile ? 'text-sm' : 'text-lg'
          }`}>
            Créez des pièces uniques qui vous ressemblent
          </div>
        </div>

        {/* Main content - Enhanced Card */}
        <div className={`relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden animate-fade-in-up delay-400 ${
          isMobile ? 'p-5' : 'p-8 md:p-10'
        }`}>
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-green-500/10 opacity-50"></div>
          
          <div className="relative z-10">
            {/* Contact Info with WhatsApp */}
            <div className={`text-center mb-6 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <div className={`inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl shadow-xl transition-all duration-300 ${
                isMobile 
                  ? 'px-5 py-3 active:scale-95' 
                  : 'px-8 py-4 hover:scale-105 hover:shadow-2xl'
              }`}>
                <svg className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <div className="text-left">
                  <div className={`font-black ${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>
                    Contactez-nous sur WhatsApp
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...(isMobile ? handlePress(() => {}, 'medium') : {})}
                    className={`font-black hover:underline ${isMobile ? 'text-lg' : 'text-2xl'}`}
                  >
                    {whatsappNumber}
                  </a>
                </div>
              </div>
              <p className={`text-white/80 font-semibold max-w-2xl mx-auto ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                Discutons ensemble des détails de votre projet de personnalisation
              </p>
            </div>

            {/* Pricing section - Enhanced */}
            <div className={`bg-gradient-to-br from-black/40 via-black/30 to-transparent backdrop-blur-md rounded-2xl border-2 border-white/10 shadow-xl ${
              isMobile ? 'p-5' : 'p-8'
            }`}>
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-2 bg-accent/20 border border-accent/50 rounded-full mb-3 ${
                  isMobile ? 'px-4 py-2' : 'px-6 py-2'
                }`}>
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  <span className={`text-accent font-bold uppercase tracking-wider ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    Nos Tarifs
                  </span>
                </div>
                <h3 className={`font-black uppercase bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent mb-3 ${
                  isMobile ? 'text-xl' : 'text-2xl md:text-3xl'
                }`}>
                  Tarifs des personnalisations
                </h3>
                <p className={`text-white/70 font-semibold max-w-xl mx-auto ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  Prix variables selon le type de tissu, le modèle et le format de votre design
                </p>
              </div>
              
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {/* T-shirts Card */}
                <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border-2 border-white/10 hover:border-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl filter drop-shadow-lg">👕</span>
                      <span className={`font-black text-white ${isMobile ? 'text-base' : 'text-lg'}`}>T-shirts</span>
                    </div>
                    <p className={`font-black text-accent mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      80 000 - 120 000 GNF
                    </p>
                    <p className="text-xs text-white/60 font-semibold">
                      Coton ou maillot
                    </p>
                  </div>
                </div>

                {/* T-shirts Bootleg Card */}
                <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border-2 border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl filter drop-shadow-lg">🎸</span>
                      <span className={`font-black text-white ${isMobile ? 'text-base' : 'text-lg'}`}>T-shirts Bootleg</span>
                    </div>
                    <p className={`font-black text-green-400 mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      120 000 GNF
                    </p>
                    <p className="text-xs text-white/60 font-semibold">
                      Avec photos incrustées
                    </p>
                  </div>
                </div>

                {/* Pulls Card */}
                <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border-2 border-white/10 hover:border-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl filter drop-shadow-lg">🧥</span>
                      <span className={`font-black text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Pulls</span>
                    </div>
                    <p className={`font-black text-accent mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      180 000 - 220 000 GNF
                    </p>
                    <p className="text-xs text-white/60 font-semibold">
                      Qualité premium
                    </p>
                  </div>
                </div>

                {/* Survêtements Card */}
                <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border-2 border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl filter drop-shadow-lg">🏃</span>
                      <span className={`font-black text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Survêtements</span>
                    </div>
                    <p className={`font-black text-green-400 mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      280 000 - 350 000 GNF
                    </p>
                    <p className="text-xs text-white/60 font-semibold">
                      Ensemble complet
                    </p>
                  </div>
                </div>

                {/* Accessoires Card */}
                <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border-2 border-white/10 hover:border-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl filter drop-shadow-lg">🧢</span>
                      <span className={`font-black text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Accessoires</span>
                    </div>
                    <p className={`font-black text-accent mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      80 000 GNF
                    </p>
                    <p className="text-xs text-white/60 font-semibold">
                      Bonnets, casquettes, masques
                    </p>
                  </div>
                </div>

                {/* Délai Card - Special */}
                <div className="group relative bg-gradient-to-br from-green-500/20 to-accent/20 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/30 hover:border-green-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-accent/20 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <span className="text-4xl mb-2 animate-bounce filter drop-shadow-lg">⏱️</span>
                    <p className={`font-black text-white mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>
                      Délai de production
                    </p>
                    <p className={`font-black text-green-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      2 à 3 jours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons - Enhanced */}
          <div className={`mt-8 flex flex-col items-center gap-4 ${isMobile ? 'sm:flex-col' : 'sm:flex-row sm:justify-center'}`}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              {...(isMobile ? handlePress(() => {}, 'medium') : {})}
              className={`group relative inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-2xl border-2 border-green-400/50 overflow-hidden touch-target ${
                isMobile 
                  ? 'gap-3 px-8 py-4 text-base w-full active:scale-95' 
                  : 'gap-4 px-12 py-5 text-lg hover:scale-105 active:scale-95 hover:shadow-green-500/50'
              }`}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <svg className={`relative z-10 ${isMobile ? 'w-6 h-6' : 'w-7 h-7'} animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="relative z-10">Contactez-nous sur WhatsApp</span>
              <svg className={`relative z-10 transition-transform duration-300 ${
                isMobile ? 'w-5 h-5' : 'w-6 h-6 group-hover:translate-x-2'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            <a
              href="/personnalisation"
              className={`group relative inline-flex items-center justify-center bg-transparent text-white rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg border-2 border-white/30 backdrop-blur-sm overflow-hidden touch-target ${
                isMobile 
                  ? 'gap-3 px-8 py-4 text-base w-full active:scale-95 hover:bg-white/10 hover:border-white/60' 
                  : 'gap-4 px-12 py-5 text-lg hover:bg-white/10 hover:shadow-xl hover:border-white/60'
              }`}
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">En Savoir Plus</span>
              <svg className={`relative z-10 transition-transform duration-300 ${
                isMobile ? 'w-5 h-5' : 'w-6 h-6 group-hover:translate-x-2'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
