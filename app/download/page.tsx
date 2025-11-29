'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function DownloadPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const downloadItems = [
    {
      id: 1,
      title: 'Adobe Photoshop',
      version: '2025',
      description: 'Retouche photo professionnelle et design graphique avancé',
      format: 'Dossier complet',
      size: 'Multiple fichiers',
      color: 'from-blue-500 to-cyan-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.85 8.42c0-.78-.05-1.45-.05-1.45h-.02s-.5 3.5-.5 3.5l-.93 5.55H6.85L6 10.5s-.48-3.5-.48-3.5h-.02s-.05.67-.05 1.45L5.1 15H3.85l.8-6.58h1.7l.4 2.5s.4-2.5.4-2.5h1.7L9.65 15H8.4l-.55-6.58zm4.98 2.48c-.9 0-1.6.7-1.6 1.6s.7 1.6 1.6 1.6 1.6-.7 1.6-1.6-.7-1.6-1.6-1.6zm0 2.7c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/>
        </svg>
      ),
      downloadUrl: 'https://www.mediafire.com/folder/87oaehcg4jz8m/Adobe+Photoshop+2025+GRANDSON',
      featured: true
    },
    {
      id: 2,
      title: 'Adobe Illustrator',
      version: '2025',
      description: 'Création vectorielle et illustration professionnelle',
      format: 'Fichier ZIP',
      size: 'Téléchargement direct',
      color: 'from-orange-500 to-amber-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.53 10.73l1.45-4.05h.04l1.36 4.05h-2.85zm-3.28 5.82l.87-2.54h3.9l.87 2.54h1.87L11.1 6.1H9.9L7.25 16.55h1.87zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      ),
      downloadUrl: 'https://www.mediafire.com/file/iaqghwoojcvs1zx/Adobe_Illustrator_2025_Grandson.zip/file',
      featured: true
    },
    {
      id: 3,
      title: 'Affinity Designer',
      version: 'Latest',
      description: 'Alternative professionnelle pour le design vectoriel',
      format: 'Site officiel',
      size: 'Version d\'essai',
      color: 'from-purple-500 to-pink-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      downloadUrl: 'https://affinity.serif.com/designer/',
      featured: false
    },
    {
      id: 4,
      title: 'Figma',
      version: 'Web & Desktop',
      description: 'Design collaboratif et prototypage d\'interfaces',
      format: 'Site officiel',
      size: 'Gratuit',
      color: 'from-red-500 to-rose-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 2.25a3.25 3.25 0 0 1 0 6.5H12V2.25h3.5zM8.5 2.25A3.25 3.25 0 0 0 8.5 8.75H12V2.25H8.5zM8.5 8.75A3.25 3.25 0 0 0 8.5 15.25H12V8.75H8.5zM8.5 15.25A3.25 3.25 0 1 0 12 18.5v-3.25H8.5zM15.5 8.75A3.25 3.25 0 1 1 12 12v-3.25h3.5z"/>
        </svg>
      ),
      downloadUrl: 'https://www.figma.com/downloads/',
      featured: false
    }
  ];

  const handleDownload = (item: any) => {
    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg animate-pulse">Chargement des téléchargements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-b border-accent/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-accent/50 rounded-2xl mb-4 mx-auto shadow-lg shadow-accent/20 animate-bounce">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent animate-fade-in">
              Logiciels de Design
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Téléchargez les meilleurs outils de création graphique professionnels
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-12">
        {/* Featured Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Logiciels en vedette
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {downloadItems.filter(item => item.featured).map((item, index) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-6 md:p-8 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:scale-[1.02] overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`flex items-center justify-center w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>
                    <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                      {item.version}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Format</span>
                      <span className="text-sm font-medium text-accent">{item.format}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(item)}
                      className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-black font-bold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-accent/50 hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Software */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Autres logiciels
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {downloadItems.filter(item => !item.featured).map((item, index) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-accent transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-400 mb-4 text-sm text-center">{item.description}</p>
                
                <div className="flex flex-col gap-3">
                  <span className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg text-center">
                    {item.format}
                  </span>
                  <button
                    onClick={() => handleDownload(item)}
                    className="bg-accent/10 hover:bg-accent hover:text-black text-accent font-medium px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-accent/30 hover:border-accent"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Accéder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/20 rounded-lg">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Informations importantes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Ces liens vous dirigent vers les sites officiels des logiciels',
              'Certains logiciels proposent des versions d\'essai gratuites',
              'Vérifiez la compatibilité avec votre système d\'exploitation',
              'Pour toute question, n\'hésitez pas à nous contacter'
            ].map((info, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors duration-300">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-300 text-sm leading-relaxed">{info}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom spacing for mobile navigation */}
      {isMobile && <div className="h-20" aria-hidden="true" />}
    </div>
  );
}