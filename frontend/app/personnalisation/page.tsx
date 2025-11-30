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
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white overflow-hidden ${
        isMobile ? 'min-h-[60vh]' : 'min-h-[70vh]'
      }`}>
        <ParticleBackground />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className={`relative container mx-auto mobile-px flex items-center ${
          isMobile ? 'py-12' : 'py-20'
        }`}>
          <div className="max-w-6xl w-full">
            {/* Premium Badge */}
            <div className="flex justify-center mb-8 animate-fade-in-down">
              <div className={`inline-flex items-center bg-gradient-to-r from-accent/20 to-green-500/20 border-2 border-accent/50 rounded-full backdrop-blur-xl shadow-2xl ${
                isMobile ? 'px-4 py-2 gap-2' : 'px-6 py-3 gap-3'
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

            {/* Title */}
            <div className="text-center animate-fade-in-up delay-200">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`${isMobile ? 'text-5xl' : 'text-7xl'} animate-bounce filter drop-shadow-2xl`}>🎨</div>
                <div className={`${isMobile ? 'text-5xl' : 'text-7xl'} animate-bounce delay-300 filter drop-shadow-2xl`}>✨</div>
              </div>
              
              <h1 className={`font-black uppercase tracking-tight bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent mb-4 ${
                isMobile ? 'text-4xl' : 'text-6xl md:text-8xl'
              }`}>
                Personnalisation
              </h1>
              
              <h2 className={`font-black uppercase tracking-tight text-white/90 mb-6 ${
                isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'
              }`}>
                de vos articles
              </h2>
              
              <p className={`text-neutral-300 max-w-4xl mx-auto leading-relaxed font-semibold ${
                isMobile ? 'text-base' : 'text-xl md:text-2xl'
              }`}>
                Créez des pièces uniques qui vous ressemblent. Transformez vos idées en réalité avec notre service de personnalisation premium.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`container mx-auto mobile-px ${isMobile ? 'py-8' : 'py-16'}`}>
        
        {/* Contact Section - Prominent */}
        <div className={`relative bg-gradient-to-br from-green-600 to-green-500 rounded-3xl overflow-hidden shadow-2xl ${
          isMobile ? 'mb-8 p-6' : 'mb-16 p-12'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
          
          <div className="relative z-10 text-center text-white">
            <div className={`${isMobile ? 'text-5xl mb-4' : 'text-7xl mb-6'} animate-pulse`}>📱</div>
            <h2 className={`font-black uppercase mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
              Contactez-nous sur WhatsApp
            </h2>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block bg-white text-green-600 rounded-2xl font-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl ${
                isMobile ? 'text-2xl px-8 py-4' : 'text-4xl px-12 py-6'
              }`}
            >
              {whatsappNumber}
            </a>
            <p className={`mt-6 font-semibold ${isMobile ? 'text-sm' : 'text-lg'}`}>
              Discutons ensemble des détails de votre projet de personnalisation
            </p>
          </div>
        </div>

        {/* Services Overview */}
        <div className={`${isMobile ? 'mb-12' : 'mb-20'}`}>
          <div className="text-center mb-10">
            <h2 className={`font-black text-neutral-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Nos Services de Personnalisation
            </h2>
            <p className={`text-neutral-600 max-w-3xl mx-auto ${isMobile ? 'text-base' : 'text-xl'}`}>
              Nous offrons une gamme complète de services pour personnaliser tous vos articles textiles
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {/* Service 1 */}
            <div className="group bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-6 border-2 border-neutral-200 hover:border-accent hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🖨️</div>
              <h3 className="text-2xl font-black text-neutral-900 mb-3">Impression Numérique</h3>
              <p className="text-neutral-600 leading-relaxed">
                Impression haute qualité de vos designs, logos et photos sur tous types de textiles avec des couleurs éclatantes et durables.
              </p>
            </div>

            {/* Service 2 */}
            <div className="group bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎸</div>
              <h3 className="text-2xl font-black text-neutral-900 mb-3">T-shirts Bootleg</h3>
              <p className="text-neutral-600 leading-relaxed">
                Créez des t-shirts vintage avec photos incrustées, parfait pour les fans de musique, sport ou culture pop.
              </p>
            </div>

            {/* Service 3 */}
            <div className="group bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-6 border-2 border-neutral-200 hover:border-accent hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-2xl font-black text-neutral-900 mb-3">Cadeaux Personnalisés</h3>
              <p className="text-neutral-600 leading-relaxed">
                Créez des cadeaux uniques et mémorables pour vos proches avec des designs personnalisés.
              </p>
            </div>

            {/* Service 6 */}
            <div className="group bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-black text-neutral-900 mb-3">Design Sur Mesure</h3>
              <p className="text-neutral-600 leading-relaxed">
                Notre équipe peut créer des designs uniques selon vos besoins et votre vision créative.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className={`relative bg-gradient-to-br from-black via-neutral-900 to-black rounded-3xl overflow-hidden ${
          isMobile ? 'p-6 mb-12' : 'p-12 mb-20'
        }`}>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/50 rounded-full px-6 py-2 mb-4">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                <span className="text-accent font-bold uppercase tracking-wider text-sm">
                  Nos Tarifs
                </span>
              </div>
              <h2 className={`font-black text-white mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                Tarifs de Personnalisation
              </h2>
              <p className={`text-white/70 max-w-3xl mx-auto ${isMobile ? 'text-sm' : 'text-lg'}`}>
                Prix variables selon le type de tissu, le modèle et le format de votre design
              </p>
            </div>

            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {/* T-shirts */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:border-accent transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">👕</span>
                  <h3 className="text-2xl font-black text-white">T-shirts</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Coton standard</span>
                    <span className="text-accent font-black text-xl">80 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Coton premium</span>
                    <span className="text-accent font-black text-xl">100 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Maillot sport</span>
                    <span className="text-accent font-black text-xl">120 000 GNF</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    ✓ Impression recto ou verso<br/>
                    ✓ Toutes tailles disponibles<br/>
                    ✓ Couleurs illimitées
                  </p>
                </div>
              </div>

              {/* T-shirts Bootleg */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:border-green-500 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">🎸</span>
                  <h3 className="text-2xl font-black text-white">T-shirts Bootleg</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Design simple</span>
                    <span className="text-green-400 font-black text-xl">120 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Design complexe</span>
                    <span className="text-green-400 font-black text-xl">150 000 GNF</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    ✓ Photos incrustées<br/>
                    ✓ Style vintage/rétro<br/>
                    ✓ Qualité haute résolution<br/>
                    ✓ Effet vieilli disponible
                  </p>
                </div>
              </div>

              {/* Pulls */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:border-accent transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">🧥</span>
                  <h3 className="text-2xl font-black text-white">Pulls & Sweats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Sweat standard</span>
                    <span className="text-accent font-black text-xl">180 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Hoodie</span>
                    <span className="text-accent font-black text-xl">200 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Pull premium</span>
                    <span className="text-accent font-black text-xl">220 000 GNF</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    ✓ Tissu épais et chaud<br/>
                    ✓ Impression ou broderie<br/>
                    ✓ Finitions soignées
                  </p>
                </div>
              </div>

              {/* Survêtements */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:border-green-500 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">🏃</span>
                  <h3 className="text-2xl font-black text-white">Survêtements</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Ensemble standard</span>
                    <span className="text-green-400 font-black text-xl">280 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Ensemble premium</span>
                    <span className="text-green-400 font-black text-xl">320 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Ensemble luxe</span>
                    <span className="text-green-400 font-black text-xl">350 000 GNF</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    ✓ Veste + Pantalon<br/>
                    ✓ Tissu respirant<br/>
                    ✓ Personnalisation complète<br/>
                    ✓ Idéal pour équipes
                  </p>
                </div>
              </div>

              {/* Accessoires */}
              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:border-accent transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">🧢</span>
                  <h3 className="text-2xl font-black text-white">Accessoires</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Casquettes</span>
                    <span className="text-accent font-black text-xl">80 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Bonnets</span>
                    <span className="text-accent font-black text-xl">80 000 GNF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Masques</span>
                    <span className="text-accent font-black text-xl">80 000 GNF</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    ✓ Designs personnalisés<br/>
                    ✓ Parfait pour cadeaux
                  </p>
                </div>
              </div>

              {/* Délai */}
              <div className="group bg-gradient-to-br from-green-500/30 to-accent/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50 hover:border-green-400 transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <span className="text-6xl mb-4 block animate-bounce">⏱️</span>
                  <h3 className="text-2xl font-black text-white mb-3">Délai de Production</h3>
                  <p className="text-5xl font-black text-green-400 mb-4">2-3 jours</p>
                  <p className="text-white/80 text-sm">
                    Délai standard pour la plupart des commandes
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/60 text-sm">
                      ⚡ Express disponible<br/>
                      📦 Livraison rapide<br/>
                      ✓ Qualité garantie
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className={`${isMobile ? 'mb-12' : 'mb-20'}`}>
          <div className="text-center mb-10">
            <h2 className={`font-black text-neutral-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Comment Ça Marche ?
            </h2>
            <p className={`text-neutral-600 max-w-3xl mx-auto ${isMobile ? 'text-base' : 'text-xl'}`}>
              Un processus simple en 4 étapes pour créer votre article personnalisé
            </p>
          </div>

          <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-accent to-green-500 rounded-2xl p-8 text-white text-center shadow-xl hover:scale-105 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-black text-accent shadow-lg">
                  1
                </div>
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-black mb-3">Contactez-nous</h3>
                <p className="text-white/90">
                  Envoyez-nous un message sur WhatsApp avec votre idée
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-neutral-900 to-black rounded-2xl p-8 text-white text-center shadow-xl hover:scale-105 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-black text-neutral-900 shadow-lg">
                  2
                </div>
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-black mb-3">Design</h3>
                <p className="text-white/90">
                  Nous créons ou adaptons votre design selon vos besoins
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-accent to-green-500 rounded-2xl p-8 text-white text-center shadow-xl hover:scale-105 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-black text-accent shadow-lg">
                  3
                </div>
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-black mb-3">Validation</h3>
                <p className="text-white/90">
                  Vous validez le design et nous lançons la production
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-neutral-900 to-black rounded-2xl p-8 text-white text-center shadow-xl hover:scale-105 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-black text-neutral-900 shadow-lg">
                  4
                </div>
                <div className="text-6xl mb-4">🚚</div>
                <h3 className="text-2xl font-black mb-3">Livraison</h3>
                <p className="text-white/90">
                  Recevez votre article personnalisé en 2-3 jours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`bg-gradient-to-br from-neutral-50 to-white rounded-3xl ${
          isMobile ? 'p-6 mb-12' : 'p-12 mb-20'
        }`}>
          <div className="text-center mb-10">
            <h2 className={`font-black text-neutral-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Questions Fréquentes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-accent transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">❓</span>
                Quels types de designs acceptez-vous ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Nous acceptons tous types de designs : logos, textes, photos, illustrations, dessins personnalisés. 
                Vous pouvez nous envoyer vos fichiers en format PNG, JPG, PDF ou AI. Si vous n'avez pas de design, 
                notre équipe peut en créer un pour vous !
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">📏</span>
                Quelle est la taille maximale d'impression ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Pour les t-shirts, nous pouvons imprimer jusqu'à 40x50cm (format A3+). Pour les autres articles, 
                les dimensions varient selon le support. Contactez-nous pour des besoins spécifiques !
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-accent transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                Puis-je commander plusieurs couleurs de t-shirts ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Absolument ! Nous avons un large choix de couleurs disponibles : noir, blanc, gris, bleu, rouge, 
                vert, jaune, et bien d'autres. Vous pouvez même commander le même design sur différentes couleurs.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">💰</span>
                Y a-t-il une quantité minimum de commande ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Non ! Vous pouvez commander à partir d'une seule pièce. Cependant, pour les commandes en gros 
                (10 pièces ou plus), nous offrons des tarifs dégressifs. Contactez-nous pour un devis personnalisé.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-accent transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">🧼</span>
                Comment entretenir mes articles personnalisés ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Lavage en machine à 30°C maximum, à l'envers. Pas de sèche-linge. Repassage à basse température 
                sur l'envers. Nos impressions sont conçues pour durer des années avec un entretien approprié !
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                Proposez-vous un service express ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Oui ! Pour les commandes urgentes, nous proposons un service express 24h (supplément de 50%). 
                Contactez-nous pour vérifier la disponibilité selon votre demande.
              </p>
            </div>

            {/* FAQ 7 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-accent transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                Faites-vous des uniformes pour entreprises ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Oui ! Nous sommes spécialisés dans la création d'uniformes d'entreprise, tenues d'équipe sportive, 
                et vêtements pour événements. Nous offrons des tarifs préférentiels pour les commandes en volume.
              </p>
            </div>

            {/* FAQ 8 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 transition-all duration-300">
              <h3 className="text-xl font-black text-neutral-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                La qualité d'impression est-elle garantie ?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Absolument ! Nous utilisons des équipements professionnels et des encres de haute qualité. 
                Si vous n'êtes pas satisfait du résultat, nous nous engageons à refaire votre article gratuitement.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Section - Dynamic */}
        {galleryItems.length > 0 && (
        <div className={`${isMobile ? 'mb-12' : 'mb-20'}`}>
          <div className="text-center mb-10">
            <h2 className={`font-black text-neutral-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Exemples de Réalisations
            </h2>
            <p className={`text-neutral-600 max-w-3xl mx-auto ${isMobile ? 'text-base' : 'text-xl'}`}>
              Découvrez quelques-unes de nos créations personnalisées
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3 lg:grid-cols-4'}`}>
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative aspect-square bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="font-black text-lg">{item.title}</p>
                    <p className="text-sm">{item.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Final CTA */}
        <div className="relative bg-gradient-to-br from-black via-neutral-900 to-black rounded-3xl overflow-hidden p-12 text-center">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <div className="text-7xl mb-6 animate-bounce">🚀</div>
            <h2 className={`font-black text-white mb-6 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              Prêt à Créer Votre Article Unique ?
            </h2>
            <p className={`text-white/80 max-w-2xl mx-auto mb-10 ${isMobile ? 'text-base' : 'text-xl'}`}>
              Contactez-nous dès maintenant sur WhatsApp et donnons vie à vos idées ensemble !
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 ${
                isMobile ? 'gap-3 px-8 py-4 text-base' : 'gap-4 px-12 py-6 text-xl'
              }`}
            >
              <svg className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Contactez-nous Maintenant</span>
            </a>

            <p className={`text-white/60 mt-6 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Réponse rapide garantie • Devis gratuit • Service professionnel
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
