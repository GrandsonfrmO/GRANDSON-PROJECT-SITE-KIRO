'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Aminata Diallo",
    location: "Conakry",
    rating: 5,
    comment: "Qualité exceptionnelle ! Les produits sont exactement comme sur les photos. Livraison rapide et service client au top.",
    avatar: "👩🏾"
  },
  {
    id: 2,
    name: "Mamadou Bah",
    location: "Kankan",
    rating: 5,
    comment: "Style unique et moderne. J'ai reçu beaucoup de compliments sur ma nouvelle tenue. Je recommande vivement !",
    avatar: "👨🏾"
  },
  {
    id: 3,
    name: "Fatoumata Camara",
    location: "Labé",
    rating: 5,
    comment: "Service impeccable ! L'équipe est très professionnelle et les conseils sont personnalisés. Parfait pour le style urbain.",
    avatar: "👩🏾‍🦱"
  },
  {
    id: 4,
    name: "Ibrahima Sow",
    location: "Boké",
    rating: 5,
    comment: "Enfin une marque qui comprend le style de la jeunesse guinéenne ! Produits de qualité à prix abordable.",
    avatar: "👨🏾‍🦲"
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-black to-neutral-800 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 px-6 py-2 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-accent font-bold uppercase text-sm tracking-wider">
              ⭐ Témoignages clients
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Ce Que Disent
            </span>
            <span className="block text-accent mt-2">
              Nos Clients
            </span>
          </h2>
          
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
            Découvrez pourquoi des milliers de clients nous font confiance pour leur style
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 mx-4">
                    <div className="text-center">
                      {/* Avatar */}
                      <div className="text-6xl mb-6 animate-float">
                        {testimonial.avatar}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex justify-center mb-6">
                        {renderStars(testimonial.rating)}
                      </div>
                      
                      {/* Comment */}
                      <blockquote className="text-white text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                        "{testimonial.comment}"
                      </blockquote>
                      
                      {/* Author */}
                      <div className="text-center">
                        <div className="text-accent font-black text-lg mb-1">
                          {testimonial.name}
                        </div>
                        <div className="text-neutral-400 text-sm uppercase tracking-wide">
                          📍 {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-accent scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="text-white">
            <div className="text-3xl md:text-4xl font-black text-accent mb-2">500+</div>
            <div className="text-neutral-400 text-sm uppercase tracking-wide">Clients Satisfaits</div>
          </div>
          <div className="text-white">
            <div className="text-3xl md:text-4xl font-black text-accent mb-2">4.9/5</div>
            <div className="text-neutral-400 text-sm uppercase tracking-wide">Note Moyenne</div>
          </div>
          <div className="text-white">
            <div className="text-3xl md:text-4xl font-black text-accent mb-2">24h</div>
            <div className="text-neutral-400 text-sm uppercase tracking-wide">Livraison Rapide</div>
          </div>
          <div className="text-white">
            <div className="text-3xl md:text-4xl font-black text-accent mb-2">100%</div>
            <div className="text-neutral-400 text-sm uppercase tracking-wide">Qualité Garantie</div>
          </div>
        </div>
      </div>
    </div>
  );
}