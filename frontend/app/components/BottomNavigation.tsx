'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import Cart from './Cart';
import TabBarParticles from './TabBarParticles';
import RippleEffect from './RippleEffect';
import TabProgressIndicator from './TabProgressIndicator';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  
  const cartItemCount = getTotalItems();

  // Hide/show bottom nav on scroll for better UX
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY, isMobile]);

  // Update active index based on current pathname
  useEffect(() => {
    const navItems = [
      { href: '/', label: 'Accueil' },
      { href: '/products', label: 'Produits' },
      { href: '/starter-pack', label: 'Starter' },
      { href: '#cart', label: 'Panier', isCart: true },
      { href: '/contact', label: 'Contact' }
    ];
    
    const isActive = (href: string) => {
      if (href === '/') {
        return pathname === '/';
      }
      return pathname?.startsWith(href);
    };
    
    const currentIndex = navItems.findIndex(item => isActive(item.href));
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  // Don't show bottom nav on admin pages or desktop
  if (pathname?.startsWith('/admin') || !isMobile) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: 'Accueil',
      emoji: '🏠',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/products',
      label: 'Produits',
      emoji: '📦',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      href: '/starter-pack',
      label: 'Starter',
      emoji: '🎁',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    {
      href: '#cart',
      label: 'Panier',
      emoji: '🛒',
      isCart: true,
      icon: (
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItemCount > 0 && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </div>
          )}
        </div>
      )
    },
    {
      href: '/contact',
      label: 'Contact',
      emoji: '💬',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const handleNavClick = (item: any, index: number) => {
    setActiveIndex(index);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (item.isCart) {
      setCartOpen(true);
    }
  };

  const handleLinkClick = (index: number) => {
    setActiveIndex(index);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <>
      {/* Bottom Navigation - Floating Design */}
      <nav className={`fixed bottom-4 left-4 right-4 z-40 transition-all duration-500 ${
        isVisible ? 'translate-y-0' : 'translate-y-32'
      }`}>
        {/* Glassmorphism Background with rounded corners */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Particle effects */}
          <TabBarParticles />
          
          {/* Background with blur and gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl rounded-3xl"></div>
          
          {/* Border with gradient */}
          <div className="absolute inset-0 rounded-3xl border-2 border-white/10"></div>
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-8 w-2 h-2 bg-accent rounded-full animate-ping"></div>
            <div className="absolute top-4 right-12 w-1 h-1 bg-green-500 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-3 left-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-2 right-8 w-1 h-1 bg-accent rounded-full animate-ping delay-1500"></div>
          </div>
          
          {/* Enhanced progress indicator */}
          <TabProgressIndicator activeIndex={activeIndex} totalTabs={navItems.length} />

          {/* Safe area padding for devices with home indicator */}
          <div className="relative">
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.map((item, index) => {
                const active = isActive(item.href);
                
                if (item.isCart) {
                  return (
                    <RippleEffect
                      key={item.href}
                      onClick={() => handleNavClick(item, index)}
                      className={`group relative flex flex-col items-center justify-center min-w-0 flex-1 py-2.5 px-2 min-h-[56px] transition-all duration-150 rounded-xl active:scale-90 cursor-pointer ${
                        active 
                          ? 'text-accent scale-105' 
                          : 'text-white/70 hover:text-white hover:scale-105'
                      }`}
                    >
                      {/* Icon container with floating effect */}
                      <div className={`relative transition-all duration-300 ${
                        active ? 'mb-0.5' : ''
                      }`}>
                        <div className={`relative z-10 transition-all duration-300 scale-90 ${
                          active ? 'drop-shadow-lg' : ''
                        }`}>
                          {item.icon}
                        </div>
                      </div>
                      
                      {/* Label with modern typography */}
                      <span className={`text-xs font-bold truncate w-full text-center transition-all duration-300 ${
                        active ? 'text-accent' : 'text-white/70 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                    </RippleEffect>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleLinkClick(index)}
                    className={`group relative flex flex-col items-center justify-center min-w-0 flex-1 py-2.5 px-2 min-h-[56px] transition-all duration-150 rounded-xl active:scale-90 ${
                      active 
                        ? 'text-accent scale-105' 
                        : 'text-white/70 hover:text-white hover:scale-105'
                    }`}
                    aria-label={item.label}
                  >
                    {/* Icon container with floating effect */}
                    <div className={`relative transition-all duration-300 ${
                      active ? 'mb-0.5' : ''
                    }`}>
                      <div className={`relative z-10 transition-all duration-300 scale-90 ${
                        active ? 'drop-shadow-lg' : ''
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Label with modern typography */}
                    <span className={`text-xs font-bold truncate w-full text-center transition-all duration-300 ${
                      active ? 'text-accent' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-2 left-4 w-8 h-8 bg-accent/10 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-2 right-4 w-6 h-6 bg-green-500/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Bottom padding for content to avoid overlap with bottom nav */}
      {isMobile && <div className="h-24" aria-hidden="true" />}
    </>
  );
}