'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-accent py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h3 className="text-3xl font-black text-black mb-4">
              Merci pour votre inscription !
            </h3>
            <p className="text-black/80 text-lg mb-6">
              Vous recevrez bientôt nos dernières nouveautés et offres exclusives.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105"
            >
              S'inscrire à nouveau
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-gradient-to-r from-accent/10 to-green-500/10 border border-accent/20 px-6 py-2 rounded-full mb-8">
            <span className="text-accent font-bold uppercase text-sm tracking-wider">
              📧 Restez connecté
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6">
            Ne Ratez Aucune
            <span className="block text-accent mt-2">
              Nouveauté
            </span>
          </h2>
          
          <p className="text-neutral-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Inscrivez-vous à notre newsletter pour recevoir en avant-première nos nouvelles collections, 
            offres exclusives et conseils style.
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-neutral-200 focus:border-accent focus:outline-none text-neutral-900 placeholder-neutral-500 transition-all duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Inscription...</span>
                  </>
                ) : (
                  <>
                    <span>S'inscrire</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-green-500/10 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">
                Offres Exclusives
              </h3>
              <p className="text-neutral-600 text-sm">
                Accédez à des réductions spéciales réservées aux abonnés
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-green-500/10 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">
                Avant-Première
              </h3>
              <p className="text-neutral-600 text-sm">
                Découvrez nos nouvelles collections avant tout le monde
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-green-500/10 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">
                Conseils Style
              </h3>
              <p className="text-neutral-600 text-sm">
                Recevez des tips et tendances pour parfaire votre look
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-neutral-500 text-xs mt-8 max-w-lg mx-auto">
            Nous respectons votre vie privée. Vos données ne seront jamais partagées avec des tiers. 
            Vous pouvez vous désabonner à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}