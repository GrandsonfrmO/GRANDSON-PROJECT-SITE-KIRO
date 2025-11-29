'use client';

import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import ProductGrid from './components/ProductGrid';
import CategoryFilter from './components/CategoryFilter';
import AboutSection from './components/AboutSection';
import FAQSection from './components/FAQSection';
import ParticleBackground from './components/ParticleBackground';
import CustomizationBanner from './components/CustomizationBanner';
import BrandImages from './components/BrandImages';
import WelcomePopup from './components/WelcomePopup';
import { Product } from './types';
import { transformProducts } from './lib/dataTransform';
import { useIsMobile, useViewportHeight } from './hooks/useIsMobile';
import { useInteractiveButton } from './hooks/useHapticFeedback';


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [brandImages, setBrandImages] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Mobile optimizations
  const isMobile = useIsMobile();
  const viewportHeight = useViewportHeight();
  const { handlePress } = useInteractiveButton();
  


  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Utiliser fetch directement vers les APIs du frontend Next.js
      const [productsResponse, settingsResponse, brandImagesResponse] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/settings').then(res => res.json()),
        fetch('/api/admin/brand-images').then(res => res.json()),
      ]);
      
      // Handle products
      const productsList = productsResponse.data?.products || productsResponse.products || [];
      const transformedProducts = transformProducts(productsList);
      const activeProducts = transformedProducts.filter((p: Product) => p.isActive);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(activeProducts.map((p: Product) => p.category))
      ) as string[];
      setCategories(uniqueCategories);

      // Handle settings
      setSettings(settingsResponse);

      // Handle brand images
      if (brandImagesResponse.success) {
        const images = [
          {
            id: 1,
            src: brandImagesResponse.data.brandImage1,
            alt: 'Grandson Entertainment Logo',
            priority: true
          },
          {
            id: 2,
            src: brandImagesResponse.data.brandImage2,
            alt: 'Made in Guinea Label',
            priority: true
          },
          {
            id: 3,
            src: brandImagesResponse.data.brandImage3,
            alt: 'Grandson Horse Mascot',
            priority: true
          }
        ];
        setBrandImages(images);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    fetchData();
  }, [mounted]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  if (!mounted || !settings) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <WelcomePopup />
      <Layout>
      {/* Hero Banner - Ultra Modern with Mobile Optimizations */}
      <div 
        className={`relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white overflow-hidden flex items-center ${
          isMobile ? 'min-h-[70vh]' : 'min-h-[75vh]'
        }`}
      >
        {/* Advanced Particle Background */}
        <ParticleBackground />
        
        {/* Enhanced Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/5 to-transparent rounded-full animate-spin-slow"></div>
          
          {/* New floating elements */}
          <div className="absolute top-32 right-20 w-4 h-4 bg-accent rounded-full animate-float"></div>
          <div className="absolute bottom-40 left-20 w-6 h-6 bg-green-400/60 rounded-full animate-float delay-500"></div>
          <div className="absolute top-60 left-1/3 w-3 h-3 bg-white/40 rounded-full animate-float delay-1000"></div>
        </div>
        
        <div className={`relative container mx-auto mobile-px flex items-center ${
          isMobile ? 'py-6' : 'py-12 md:py-16'
        }`}>
          <div className="max-w-6xl w-full">
            {/* Logo Zone - Mobile Optimized */}
            {settings.data?.logo && (
              <div className={`${isMobile ? 'mb-8' : 'mb-16'} animate-fade-in-down`}>
                <div className={`inline-flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/10 shadow-2xl transition-all duration-300 group relative overflow-hidden ${
                  isMobile 
                    ? 'p-4 active:scale-95 hover:border-accent/50' 
                    : 'p-8 hover:border-accent/50 hover:scale-105'
                }`}>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {settings.data.logo.imageUrl ? (
                    <div className={`relative w-auto z-10 ${
                      isMobile 
                        ? 'h-20 max-w-[280px]' 
                        : 'h-28 sm:h-36 md:h-44 max-w-[320px] sm:max-w-[400px] md:max-w-[520px]'
                    }`} style={{ perspective: '1000px' }}>
                      <img
                        src={settings.data.logo.imageUrl}
                        alt={settings.data.logo.text || 'Logo'}
                        className={`h-full w-auto object-contain drop-shadow-2xl transition-all duration-300 animate-rotate-logo ${
                          isMobile ? '' : 'group-hover:drop-shadow-[0_0_40px_rgba(34,197,94,0.6)]'
                        }`}
                        style={{ transformStyle: 'preserve-3d' }}
                      />
                    </div>
                  ) : (
                    <div className="text-center z-10" style={{ perspective: '1000px' }}>
                      <div className={`font-black tracking-tight uppercase bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent transition-transform duration-300 animate-rotate-logo ${
                        isMobile 
                          ? 'text-4xl' 
                          : 'text-6xl sm:text-7xl md:text-8xl group-hover:scale-110'
                      }`} style={{ transformStyle: 'preserve-3d' }}>
                        {settings.data.logo.text || 'GRANDSON PROJECT'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brand Images - Three rotating images */}
            <div className={`${isMobile ? 'mb-8' : 'mb-12'} animate-fade-in-up delay-300`}>
              <BrandImages images={brandImages.length > 0 ? brandImages : undefined} />
            </div>

            {settings.hero?.badge && (
              <div className={`inline-block bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/50 rounded-full backdrop-blur-sm animate-fade-in-up transition-transform duration-300 cursor-default ${
                isMobile 
                  ? 'px-4 py-2 mb-6 active:scale-95' 
                  : 'px-8 py-4 mb-12 hover:scale-105'
              }`}>
                <span className={`text-accent font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isMobile ? 'text-sm' : 'text-base gap-3'
                }`}>
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  {settings.hero.badge}
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500"></span>
                </span>
              </div>
            )}
            
            <h1 className={`font-black leading-tight animate-fade-in-up delay-200 ${
              isMobile 
                ? 'text-4xl mb-6 text-responsive-4xl' 
                : 'text-7xl md:text-8xl lg:text-9xl mb-12'
            }`}>
              <span className={`bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent transition-all duration-1000 cursor-default ${
                isMobile ? '' : 'hover:from-accent hover:to-green-400'
              }`}>
                {settings.hero?.title || 'Bienvenue'}
              </span>
              {settings.hero?.subtitle && (
                <span className={`block text-accent bg-gradient-to-r from-accent to-green-400 bg-clip-text text-transparent animate-pulse transition-transform duration-500 cursor-default ${
                  isMobile ? 'mt-2' : 'hover:scale-105'
                }`}>
                  {settings.hero.subtitle}
                </span>
              )}
            </h1>
            
            <p className={`text-neutral-300 max-w-4xl leading-relaxed animate-fade-in-up delay-400 transition-colors duration-300 ${
              isMobile 
                ? 'text-lg text-responsive-xl hover:text-neutral-200' 
                : 'text-2xl md:text-3xl hover:text-neutral-200'
            }`}>
              {settings.hero?.description || 'Découvrez notre collection de produits de qualité premium avec des designs uniques et innovants'}
            </p>
          </div>
        </div>
        
        {/* Enhanced Scroll indicator - Mobile Optimized */}
        <div 
          className={`absolute left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group touch-target ${
            isMobile ? 'bottom-4' : 'bottom-8'
          }`}
          onClick={handlePress(() => {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
          }, 'light')}
        >
          <div className={`border-2 border-white/30 rounded-full flex justify-center transition-colors duration-300 backdrop-blur-sm ${
            isMobile 
              ? 'w-6 h-10 group-active:border-accent' 
              : 'w-8 h-12 group-hover:border-accent'
          }`}>
            <div className={`bg-white/60 rounded-full mt-2 animate-pulse transition-colors duration-300 ${
              isMobile 
                ? 'w-1 h-3 group-active:bg-accent' 
                : 'w-1.5 h-4 group-hover:bg-accent'
            }`}></div>
          </div>
          <div className={`text-white/60 mt-2 text-center font-semibold uppercase tracking-wide transition-colors duration-300 ${
            isMobile 
              ? 'text-xs group-active:text-accent' 
              : 'text-xs group-hover:text-accent'
          }`}>
            {isMobile ? 'Swipe' : 'Scroll'}
          </div>
        </div>
      </div>

      {/* Customization Banner - After Hero */}
      <CustomizationBanner />

      <div className={`container mx-auto mobile-px ${
        isMobile ? 'py-3' : 'py-6 md:py-8'
      }`}>

        {/* Starter Pack Section */}
        {settings.starterPack?.enabled && (
          <div className={`bg-linear-to-br from-neutral-900 via-neutral-800 to-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 ${
            isMobile ? 'mb-6' : 'mb-8'
          }`}>
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Left Content */}
                <div className="flex-1 text-white">
                  {settings.starterPack?.badge && (
                    <div className="inline-block bg-accent text-black px-4 py-1 rounded-full text-sm font-bold uppercase mb-4">
                      {settings.starterPack.badge}
                    </div>
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {settings.starterPack?.title || 'Pack Starter'}
                  </h2>
                  <p className="text-neutral-300 text-lg mb-6">
                    {settings.starterPack?.description || 'Découvrez notre pack de démarrage'}
                  </p>
                  
                  {/* Inclusions */}
                  <div className="space-y-3 mb-8">
                    {settings.starterPack?.items?.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-neutral-200">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                      <div className="text-sm text-neutral-400 uppercase tracking-wide mb-1">Prix du Pack</div>
                      <div className="text-4xl md:text-5xl font-bold text-accent">
                        {settings.starterPack?.price?.toLocaleString() || '0'} <span className="text-2xl">{settings.starterPack?.currency || 'FCFA'}</span>
                      </div>
                    </div>
                    {settings.contact?.phone && (
                      <a
                        href={`tel:${settings.contact.phone}`}
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-95"
                      >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contactez-nous
                    </a>
                    )}
                  </div>
                </div>

                {/* Right Visual */}
                <div className="shrink-0 hidden lg:block">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl"></div>
                    <div className="relative flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎨</div>
                        <div className="text-accent font-bold text-xl">Créez Votre</div>
                        <div className="text-white font-bold text-2xl">Marque</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Banner */}
            {settings.starterPack?.bottomBanner && (
              <div className="bg-accent text-black px-8 py-4 text-center">
                <p className="font-semibold">
                  {settings.starterPack.bottomBanner}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Products Section - Ultra Modern Design with Transparent Background */}
        <div id="products" className={`relative ${isMobile ? 'scroll-mt-16' : 'scroll-mt-20'}`}>
          
          <div className={`relative text-center ${isMobile ? 'pt-6 mb-6' : 'pt-12 mb-12'}`}>
            {/* Premium Badge with Advanced Styling */}
            <div className={`inline-flex items-center gap-2.5 bg-gradient-to-r from-black/5 via-accent/10 to-green-500/10 rounded-full border-2 border-accent/40 backdrop-blur-md animate-fade-in-up transition-all duration-500 shadow-xl relative overflow-hidden group ${
              isMobile 
                ? 'px-5 py-2.5 mb-4 active:scale-95' 
                : 'px-7 py-3.5 mb-6 hover:scale-110 hover:shadow-2xl hover:border-accent/60'
            }`}>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
              
              <span className="relative w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-neon">
                <span className="absolute inset-0 bg-accent rounded-full animate-ping opacity-75"></span>
              </span>
              <span className={`relative text-accent font-black uppercase tracking-widest ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Collection Premium
              </span>
              <span className="relative w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse delay-500 shadow-neon">
                <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75 delay-500"></span>
              </span>
            </div>
            
            {/* Title with 3D Effect */}
            <h2 className={`font-black text-neutral-900 animate-fade-in-up delay-200 leading-none mb-2 ${
              isMobile 
                ? 'text-4xl text-responsive-4xl' 
                : 'text-6xl md:text-7xl lg:text-8xl'
            }`} style={{ textShadow: '0 2px 20px rgba(0,0,0,0.05)' }}>
              <span className={`bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 bg-clip-text text-transparent transition-all duration-700 cursor-default inline-block relative ${
                isMobile ? '' : 'hover:from-accent hover:via-green-500 hover:to-accent hover:scale-105'
              }`}>
                Notre Collection
                {/* Subtle glow effect on hover */}
                {!isMobile && (
                  <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                )}
              </span>
            </h2>
            
            {/* Decorative Line */}
            <div className={`flex items-center justify-center gap-3 ${isMobile ? 'my-4' : 'my-6'}`}>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-neon"></div>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
            </div>
            
            {/* Description with Better Typography */}
            <p className={`text-neutral-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400 transition-all duration-300 font-medium ${
              isMobile 
                ? 'text-base mb-5 text-responsive-xl hover:text-neutral-800' 
                : 'text-xl md:text-2xl mb-10 hover:text-neutral-800 hover:scale-[1.02]'
            }`}>
              Découvrez nos produits soigneusement sélectionnés pour leur qualité exceptionnelle et leur design unique
            </p>
            
            <div className={`inline-flex items-center bg-gradient-to-r from-accent/10 to-green-500/10 rounded-full border border-accent/20 shadow-lg animate-fade-in-up delay-600 transition-transform duration-300 ${
              isMobile 
                ? 'gap-2 px-4 py-2 active:scale-95' 
                : 'gap-3 px-8 py-4 hover:scale-105'
            }`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className={`text-neutral-700 font-bold ${
                isMobile ? 'text-sm' : 'text-lg'
              }`}>
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
              </span>
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse delay-500"></span>
            </div>
          </div>

          {/* Category Filter - Mobile Optimized */}
          <div className={`relative ${isMobile ? 'mb-4' : 'mb-10'}`}>
            <div className={`text-center ${isMobile ? 'mb-2' : 'mb-6'}`}>
              <h3 className={`font-black text-neutral-800 mb-2 ${
                isMobile ? 'text-lg' : 'text-2xl'
              }`}>Filtrer par Catégorie</h3>
              <p className={`text-neutral-600 ${
                isMobile ? 'text-sm' : ''
              }`}>Trouvez exactement ce que vous cherchez</p>
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Products Grid - Mobile Optimized Loading & Empty States */}
          {loading ? (
            <div className={`grid gap-4 ${
              isMobile 
                ? 'grid-cols-2 grid-mobile-2' 
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8'
            }`}>
              {[...Array(isMobile ? 6 : 8)].map((_, i) => (
                <div key={i} className="animate-pulse group">
                  <div className={`aspect-square bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-200 rounded-2xl loading-skeleton ${
                    isMobile ? 'mb-3' : 'mb-4'
                  }`}></div>
                  <div className={`bg-neutral-200 rounded-lg loading-skeleton ${
                    isMobile ? 'h-4 w-3/4 mb-2' : 'h-6 w-3/4 mb-3'
                  }`}></div>
                  <div className={`bg-neutral-200 rounded-lg loading-skeleton ${
                    isMobile ? 'h-3 w-1/2 mb-2' : 'h-4 w-1/2 mb-2'
                  }`}></div>
                  <div className={`bg-neutral-200 rounded-lg loading-skeleton ${
                    isMobile ? 'h-5 w-2/3' : 'h-7 w-2/3'
                  }`}></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 rounded-3xl border-2 border-neutral-200 shadow-xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-green-500/5"></div>
              
              <div className="relative z-10">
                <div className="text-9xl mb-8 animate-bounce">🔍</div>
                <h3 className="text-4xl font-black text-neutral-900 mb-6 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                  Aucun produit trouvé
                </h3>
                <p className="text-neutral-600 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                  Aucun produit ne correspond à votre sélection. Essayez une autre catégorie ou explorez toute notre collection.
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="group inline-flex items-center gap-4 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-10 py-5 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="relative z-10 w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="relative z-10">Voir tous les produits</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Afficher seulement 4 produits sur la page d'accueil */}
              <ProductGrid products={filteredProducts.slice(0, 4)} />
              
              {/* Products count indicator */}
              <div className="mt-12 text-center space-y-6">
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-neutral-200 shadow-lg">
                  <span className="text-neutral-600 font-semibold">
                    Affichage de {Math.min(4, filteredProducts.length)} sur {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                  </span>
                  {selectedCategory && (
                    <>
                      <span className="text-neutral-400">•</span>
                      <span className="text-accent font-bold">{selectedCategory}</span>
                    </>
                  )}
                </div>

                {/* Bouton Voir Plus - Affiché seulement s'il y a plus de 4 produits */}
                {filteredProducts.length > 4 && (
                  <div className="flex justify-center">
                    <a
                      href="/products"
                      className={`group relative inline-flex items-center justify-center bg-gradient-to-r from-accent to-green-500 text-black rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-2xl border-2 border-transparent overflow-hidden touch-target ${
                        isMobile 
                          ? 'gap-3 px-8 py-4 text-base active:scale-95 hover:from-green-500 hover:to-accent' 
                          : 'gap-4 px-12 py-5 text-lg hover:from-green-500 hover:to-accent hover:shadow-accent/25 hover:scale-105 active:scale-95 hover:border-white/20'
                      }`}
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">Voir Plus de Produits</span>
                      <span className="relative z-10 bg-black/20 text-white rounded-full px-3 py-1 text-sm font-black">
                        +{filteredProducts.length - 4}
                      </span>
                      <svg className={`relative z-10 transition-transform duration-300 ${
                        isMobile ? 'w-5 h-5' : 'w-6 h-6 group-hover:translate-x-2'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section - Enhanced with modern design */}
        {!loading && filteredProducts.length > 0 && (
          <div className={`relative ${isMobile ? 'mt-8' : 'mt-12'}`}>
            {/* Background with gradient and patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-neutral-800 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-green-500/10 rounded-3xl"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            <div className="relative px-8 py-16 md:py-20 text-center overflow-hidden rounded-3xl">
              <div className="max-w-4xl mx-auto">
                <div className="inline-block bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 px-6 py-2 rounded-full mb-6 backdrop-blur-sm">
                  <span className="text-accent font-bold uppercase text-sm tracking-wider">
                    🚀 Prêt à commander ?
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                    Transformez Votre Style
                  </span>
                  <span className="block text-accent mt-2">
                    Dès Aujourd'hui
                  </span>
                </h2>
                
                <p className="text-neutral-300 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                  Rejoignez des milliers de clients satisfaits. Contactez-nous pour passer votre commande ou obtenir des conseils personnalisés.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {settings.contact?.phone && (
                    <a
                      href={`tel:${settings.contact.phone}`}
                      className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-10 py-5 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-2xl hover:shadow-accent/25 hover:scale-105 active:scale-95"
                    >
                      <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Appeler Maintenant</span>
                    </a>
                  )}
                  
                  {settings.contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${settings.contact.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-3 bg-transparent hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-green-400 backdrop-blur-sm"
                    >
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
                
                {/* Trust indicators */}
                <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-neutral-400 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Livraison rapide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Qualité garantie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Support 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        <AboutSection />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </Layout>
    </>
  );
}
