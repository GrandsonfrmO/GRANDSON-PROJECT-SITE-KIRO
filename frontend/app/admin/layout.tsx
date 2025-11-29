'use client';

import './admin.css';
import dynamic from 'next/dynamic';
import Script from 'next/script';

// Lazy load ParticleBackground for better performance
const ParticleBackground = dynamic(
  () => import('../components/ParticleBackground'),
  { ssr: false }
);

// Lazy load ScrollIndicator for better performance
const ScrollIndicator = dynamic(
  () => import('./ScrollIndicator'),
  { ssr: false }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script id="admin-smooth-scroll" strategy="afterInteractive">
        {`document.documentElement.classList.add('admin-smooth-scroll');`}
      </Script>
      <div className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800 min-h-screen relative overflow-hidden">
        <ScrollIndicator />
        <ParticleBackground />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
        {children}
        
        {/* Portal container for notifications and modals */}
        <div id="admin-portal-root" className="relative" style={{ zIndex: 999999 }} />
      </div>
    </>
  );
}