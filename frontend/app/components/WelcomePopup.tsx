'use client';

import { useState, useEffect } from 'react';

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le popup à chaque visite après un court délai
    setTimeout(() => {
      setIsVisible(true);
    }, 1000);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - Transparent */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Popup - Transparent Theme */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto animate-scale-in relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-accent to-green-500 rounded-full mb-6 shadow-lg animate-bounce-slow">
              <span className="text-4xl">👋</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-white via-accent to-green-400 bg-clip-text text-transparent">
                Bienvenue !
              </span>
            </h2>

            {/* Message */}
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              Découvrez notre collection exclusive de produits streetwear premium
            </p>

            {/* OK Button */}
            <button
              onClick={handleClose}
              className="px-12 py-4 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black font-black rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-lg"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
