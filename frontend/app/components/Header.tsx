'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import SearchBar from './SearchBar';
import api from '../lib/api';
import Image from 'next/image';
import { getImageUrl } from '../lib/imageOptimization';
import { Product } from '../types';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { getTotalItems } = useCart();
  const [logo, setLogo] = useState<{ text: string; imageUrl: string | null } | null>(null);
  const router = useRouter();

  const cartItemCount = getTotalItems();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch logo settings
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        console.log('📝 Settings API response:', settingsData);
        
        if (settingsData.success && settingsData.data && settingsData.data.logo) {
          console.log('✅ Logo trouvé:', settingsData.data.logo);
          setLogo(settingsData.data.logo);
        } else {
          console.warn('⚠️ Structure de données inattendue, utilisation du logo par défaut');
          setLogo({ text: 'GRANDSON PROJECT', imageUrl: null });
        }

        // Fetch products for search
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        if (productsData.success && productsData.data?.products) {
          setProducts(productsData.data.products.filter((p: Product) => p.isActive));
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setLogo({ text: 'GRANDSON PROJECT', imageUrl: null });
      }
    };
    fetchData();
  }, []);

  const handleProductSelect = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  return (
    <>
      <header className="sticky top-4 z-50 px-4">
        <div className="bg-black/95 backdrop-blur-xl text-white shadow-2xl rounded-3xl border-2 border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo - Responsive & Optimized */}
            <Link href="/" className="flex items-center space-x-2 group">
              {logo?.imageUrl ? (
                <div className="relative h-12 sm:h-14 md:h-16 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px]">
                  <Image
                    src={getImageUrl(logo.imageUrl, 'logo')}
                    alt={logo.text}
                    width={220}
                    height={64}
                    className="h-full w-auto object-contain"
                    priority
                    sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 220px"
                  />
                </div>
              ) : (
                <>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight uppercase text-shadow-lg hover:text-accent transition-all duration-300">
                    {logo?.text.split(' ')[0] || 'GRANDSON'}
                  </div>
                  {logo?.text.split(' ')[1] && (
                    <div className="hidden sm:block text-xs md:text-sm text-accent font-mono uppercase tracking-widest">
                      {logo.text.split(' ').slice(1).join(' ')}
                    </div>
                  )}
                </>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <SearchBar 
                products={products}
                onProductSelect={handleProductSelect}
                placeholder="Rechercher un produit..."
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Search Icon for Mobile/Tablet */}
              <button 
                className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-800 rounded-xl transition-all duration-150 active:scale-95 border-2 border-transparent hover:border-accent"
                onClick={() => {
                  const searchModal = document.getElementById('mobile-search-modal');
                  if (searchModal) {
                    searchModal.classList.toggle('hidden');
                  }
                }}
                aria-label="Rechercher"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart Icon - Touch Optimized */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-800 rounded-xl transition-all duration-150 active:scale-95 border-2 border-transparent hover:border-accent"
                aria-label="Panier"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Menu Button - Visible on all devices */}
              <button
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-800 rounded-xl transition-all duration-150 active:scale-95 border-2 border-transparent hover:border-accent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  ) : (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  )}
                </svg>
              </button>
            </div>
            </div>
          </div>
          
          {/* Mobile Search Modal */}
          <div id="mobile-search-modal" className="hidden lg:hidden mt-2 bg-black/95 backdrop-blur-xl rounded-2xl border-2 border-white/10 p-4 animate-fade-in-down shadow-2xl">
            <SearchBar 
              products={products}
              onProductSelect={(product) => {
                handleProductSelect(product);
                document.getElementById('mobile-search-modal')?.classList.add('hidden');
              }}
              placeholder="Rechercher un produit..."
            />
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Menu Sidebar - Visible on all devices */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop with smooth fade */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          />
          
          {/* Floating Sidebar with slide animation */}
          <div 
            className="fixed top-4 right-4 bottom-4 w-80 max-w-[85vw] bg-gradient-to-br from-neutral-900 via-black to-neutral-900 shadow-2xl z-50 border-2 border-accent/30 overflow-hidden rounded-3xl"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
            
            {/* Header with glassmorphism */}
            <div className="relative flex items-center justify-between p-5 border-b border-neutral-800/50 backdrop-blur-sm bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-accent to-green-500 rounded-full"></div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Menu</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-800/80 rounded-xl transition-all duration-150 active:scale-90 border border-neutral-700 hover:border-accent"
                aria-label="Fermer le menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links with staggered animation */}
            <nav className="relative flex flex-col p-3 space-y-1 overflow-y-auto h-[calc(100%-76px)] custom-scrollbar">
              {/* Section: Navigation Principale */}
              <div className="mb-1">
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2 px-3 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Navigation
                </p>
                
                <Link 
                  href="/" 
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white hover:text-accent hover:bg-neutral-800/60 transition-all duration-150 py-3.5 px-3 rounded-xl group border border-transparent hover:border-accent/40 min-h-[52px] active:scale-98"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animation: 'slideInLeft 0.3s ease-out 0.1s both' }}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-800/50 rounded-lg group-hover:bg-accent/20 transition-all duration-150">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span>Accueil</span>
                  <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link 
                  href="/products" 
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white hover:text-accent hover:bg-neutral-800/60 transition-all duration-150 py-3.5 px-3 rounded-xl group border border-transparent hover:border-accent/40 min-h-[52px] active:scale-98"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animation: 'slideInLeft 0.3s ease-out 0.15s both' }}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-800/50 rounded-lg group-hover:bg-accent/20 transition-all duration-150">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span>Produits</span>
                  <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link 
                  href="/starter-pack" 
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white hover:text-accent hover:bg-neutral-800/60 transition-all duration-150 py-3.5 px-3 rounded-xl group border border-transparent hover:border-accent/40 min-h-[52px] active:scale-98"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animation: 'slideInLeft 0.3s ease-out 0.2s both' }}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-800/50 rounded-lg group-hover:bg-accent/20 transition-all duration-150">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span>Starter Pack</span>
                  <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-800 my-2"></div>

              {/* Section: Services */}
              <div className="mb-2">
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2 px-3 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Services
                </p>
                
                <Link 
                  href="/personnalisation" 
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white hover:text-accent hover:bg-neutral-800/60 transition-all duration-150 py-3.5 px-3 rounded-xl group border border-transparent hover:border-accent/40 min-h-[52px] active:scale-98"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animation: 'slideInLeft 0.3s ease-out 0.25s both' }}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-800/50 rounded-lg group-hover:bg-accent/20 transition-all duration-150">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span>Personnalisation</span>
                  <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link 
                  href="/download" 
                  className="flex items-center gap-3 text-base font-semibold uppercase tracking-wide hover:text-accent hover:bg-neutral-800/50 transition-all duration-200 py-3 px-4 rounded-lg touch-target group border border-transparent hover:border-accent/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </Link>

                <Link 
                  href="/order-lookup" 
                  className="flex items-center gap-3 text-base font-semibold uppercase tracking-wide hover:text-accent hover:bg-neutral-800/50 transition-all duration-200 py-3 px-4 rounded-lg touch-target group border border-transparent hover:border-accent/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Suivre ma commande</span>
                </Link>

                <Link 
                  href="/contact" 
                  className="flex items-center gap-3 text-base font-semibold uppercase tracking-wide hover:text-accent hover:bg-neutral-800/50 transition-all duration-200 py-3 px-4 rounded-lg touch-target group border border-transparent hover:border-accent/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact</span>
                </Link>
              </div>

              {/* Panier Info */}
              {cartItemCount > 0 && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mx-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-accent">Panier</span>
                    </div>
                    <span className="bg-accent text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCartOpen(true);
                    }}
                    className="mt-2 w-full bg-accent hover:bg-accent/90 text-black font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-sm uppercase"
                  >
                    Voir le panier
                  </button>
                </div>
              )}

              {/* Social Links */}
              <div className="mt-auto pt-6 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3 px-4 font-bold">Suivez-nous</p>
                <div className="flex gap-3 px-4">
                  <a 
                    href="#" 
                    className="p-3 bg-neutral-800 hover:bg-accent hover:text-black rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                      <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="p-3 bg-neutral-800 hover:bg-accent hover:text-black rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="p-3 bg-neutral-800 hover:bg-accent hover:text-black rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
