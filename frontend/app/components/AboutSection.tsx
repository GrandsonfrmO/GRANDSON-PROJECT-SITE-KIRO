'use client';

export default function AboutSection() {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block bg-gradient-to-r from-accent/10 to-green-500/10 border border-accent/20 px-6 py-2 rounded-full">
                <span className="text-accent font-bold uppercase text-sm tracking-wider">
                  🇬🇳 Notre Histoire
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
                <span className="block">Grandson Project</span>
                <span className="text-accent block mt-2">Made in Guinea</span>
              </h2>
              
              <div className="space-y-6 text-neutral-600 text-lg leading-relaxed">
                <p>
                  Née de la passion pour la mode urbaine et l'authenticité guinéenne, 
                  <strong className="text-neutral-900"> Grandson Project</strong> révolutionne 
                  le streetwear en guinee.
                </p>
                
                <p>
                  Nous créons des pièces uniques qui célèbrent notre culture tout en 
                  embrassant les tendances internationales. Chaque produit raconte une histoire, 
                  celle de la jeunesse guinéenne ambitieuse et créative.
                </p>
                
                <p>
                  De Conakry aux quatre coins du pays, nous habillons une génération 
                  qui refuse les compromis sur la qualité et le style.
                </p>
              </div>

              {/* Values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                <div className="bg-gradient-to-br from-neutral-50 to-white p-6 rounded-2xl border border-neutral-100">
                  <div className="text-3xl mb-3">🎨</div>
                  <h3 className="font-black text-neutral-900 mb-2">Créativité</h3>
                  <p className="text-neutral-600 text-sm">
                    Designs originaux inspirés de notre riche patrimoine culturel
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-neutral-50 to-white p-6 rounded-2xl border border-neutral-100">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-black text-neutral-900 mb-2">Innovation</h3>
                  <p className="text-neutral-600 text-sm">
                    Technologies modernes pour une expérience d'achat optimale
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-neutral-50 to-white p-6 rounded-2xl border border-neutral-100">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="font-black text-neutral-900 mb-2">Communauté</h3>
                  <p className="text-neutral-600 text-sm">
                    Une famille unie par la passion du style et de l'authenticité
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-neutral-50 to-white p-6 rounded-2xl border border-neutral-100">
                  <div className="text-3xl mb-3">🌟</div>
                  <h3 className="font-black text-neutral-900 mb-2">Excellence</h3>
                  <p className="text-neutral-600 text-sm">
                    Qualité premium à chaque étape, de la conception à la livraison
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Main Image Placeholder */}
              <div className="relative bg-gradient-to-br from-neutral-900 via-black to-neutral-800 rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-green-500/20"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center space-y-6">
                    <div className="text-8xl animate-float">👑</div>
                    <div className="space-y-2">
                      <div className="text-2xl font-black">GRANDSON</div>
                      <div className="text-accent text-lg font-mono tracking-widest">PROJECT</div>
                      <div className="text-neutral-400 text-sm">EST. 2024</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-12 left-8 w-20 h-20 bg-green-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              </div>

              {/* Stats Cards */}
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl border border-neutral-100">
                <div className="text-center">
                  <div className="text-3xl font-black text-accent mb-1">2024</div>
                  <div className="text-neutral-600 text-sm uppercase tracking-wide">Année de création</div>
                </div>
              </div>
              
              <div className="absolute -top-8 -right-8 bg-white rounded-2xl p-6 shadow-2xl border border-neutral-100">
                <div className="text-center">
                  <div className="text-3xl font-black text-accent mb-1">🇬🇳</div>
                  <div className="text-neutral-600 text-sm uppercase tracking-wide">Made in Guinea</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mt-20 text-center">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-neutral-900 via-black to-neutral-800 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-green-500/10"></div>
              
              <div className="relative">
                <h3 className="text-3xl md:text-4xl font-black mb-6">
                  <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                    Notre Mission
                  </span>
                </h3>
                
                <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed mb-8">
                  "Révéler le potentiel créatif de la jeunesse guineenne à travers une mode 
                  qui transcende les frontières, tout en restant fidèle à nos racines."
                </p>
                
                <div className="inline-block bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 px-8 py-3 rounded-full backdrop-blur-sm">
                  <span className="text-accent font-bold uppercase text-sm tracking-wider">
                    ✨ L'avenir de la mode Guineene
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}