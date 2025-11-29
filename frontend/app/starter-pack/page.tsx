'use client';

import Layout from '../components/Layout';
import Link from 'next/link';

export default function StarterPackPage() {
  const packIncludes = [
    {
      id: 1,
      icon: '👕',
      title: '3 t-shirts ou 2 t-shirts + 1 pull',
      description: 'Vêtements de qualité pour votre marque',
    },
    {
      id: 2,
      icon: '🧢',
      title: '1 casquette personnalisée',
      description: 'Accessoire tendance avec votre logo',
    },
    {
      id: 3,
      icon: '🏷️',
      title: 'Stickers, emballages & étiquettes',
      description: 'Tout pour un packaging professionnel',
    },
    {
      id: 4,
      icon: '🎨',
      title: 'Identité visuelle complète (tech pack)',
      description: 'Design professionnel de votre marque',
    },
    {
      id: 5,
      icon: '✨',
      title: 'Sans frais de main-d&apos;œuvre',
      description: 'Tout est inclus dans le prix',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-black via-neutral-900 to-black text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block bg-accent/10 border border-accent/30 rounded-full px-6 py-2 mb-6">
                <span className="text-accent font-bold uppercase tracking-wider text-sm">
                  🎁 Offre Spéciale
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                STARTER PACK
              </h1>
              <p className="text-2xl md:text-3xl text-accent font-bold mb-4">
                &quot;Création de Marque&quot;
              </p>
              <p className="text-xl md:text-2xl text-neutral-300 mb-8 leading-relaxed">
                Lancez votre marque avec notre pack complet incluant tout ce dont vous avez besoin
              </p>
            </div>
          </div>
        </div>

        {/* Pack Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Price Card - Featured */}
            <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 border-4 border-accent rounded-3xl p-8 md:p-12 mb-12 text-center shadow-2xl">
              <div className="mb-8">
                <p className="text-neutral-900 text-2xl md:text-3xl font-black mb-4">
                  Prix du Pack
                </p>
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-accent/20 blur-3xl"></div>
                  <p className="relative text-6xl md:text-7xl lg:text-8xl font-black text-black mb-2">
                    550 000
                  </p>
                </div>
                <p className="text-2xl md:text-3xl text-neutral-700 font-bold">GNF</p>
              </div>
              <div className="inline-block bg-green-100 border-2 border-green-500 text-green-800 px-8 py-4 rounded-2xl font-black text-lg md:text-xl mb-6">
                ✨ Sans frais de main-d&apos;œuvre
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-8 text-center">
                Ce qui est inclus
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packIncludes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-neutral-200 hover:border-accent"
                  >
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="font-black text-xl text-neutral-900 mb-3 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border border-neutral-200">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-8 text-center">
                Pourquoi choisir notre Starter Pack ?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                    <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-xl mb-3">Démarrage Rapide</h3>
                  <p className="text-neutral-600">
                    Tout ce qu&apos;il faut pour lancer votre marque immédiatement
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                    <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-xl mb-3">Qualité Professionnelle</h3>
                  <p className="text-neutral-600">
                    Design et produits de haute qualité pour votre image de marque
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                    <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-xl mb-3">Tout Inclus</h3>
                  <p className="text-neutral-600">
                    Aucun frais caché, tout est compris dans le prix
                  </p>
                </div>
              </div>
            </div>

            {/* What You Get Details */}
            <div className="bg-gradient-to-br from-neutral-900 to-black text-white rounded-3xl p-8 md:p-12 mb-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">
                Détails du Pack
              </h2>
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Vêtements personnalisés</h3>
                    <p className="text-neutral-300">
                      Choisissez entre 3 t-shirts ou 2 t-shirts + 1 pull, tous personnalisés avec votre design
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Accessoires de marque</h3>
                    <p className="text-neutral-300">
                      Une casquette personnalisée pour compléter votre collection
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Packaging complet</h3>
                    <p className="text-neutral-300">
                      Stickers, emballages et étiquettes pour une présentation professionnelle
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Tech Pack professionnel</h3>
                    <p className="text-neutral-300">
                      Identité visuelle complète avec logo, couleurs, typographie et guidelines
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-accent via-yellow-400 to-accent rounded-3xl p-1 inline-block mb-6 shadow-2xl">
                <div className="bg-black rounded-3xl px-12 py-8">
                  <p className="text-white text-2xl md:text-3xl font-black mb-6">
                    Prêt à lancer votre marque ?
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block bg-accent text-black px-12 py-5 rounded-xl font-black text-xl hover:bg-yellow-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    📞 Contactez-nous
                  </Link>
                </div>
              </div>
              <p className="text-neutral-600 text-lg mt-6">
                Appelez-nous au{' '}
                <a href="tel:+224662662958" className="text-accent font-bold hover:underline">
                  +224 662 662 958
                </a>
                {' '}ou{' '}
                <a 
                  href="https://wa.me/224662662958" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 font-bold hover:underline"
                >
                  WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
