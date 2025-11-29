'use client';

import { useState } from 'react';
import Layout from '../components/Layout';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+224',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pouvez ajouter la logique d'envoi
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header - Enhanced */}
            <div className="text-center mb-16 relative">
              <div className="inline-block bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 px-6 py-2 rounded-full mb-6">
                <span className="text-accent font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Disponible 24/7
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 bg-clip-text text-transparent">
                  Contactez-nous
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Une question ? Besoin d&apos;aide ? Notre équipe est là pour vous répondre rapidement et efficacement
              </p>

              {/* Decorative elements */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-green-500/5 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    Informations de contact
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Phone */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 mb-1">Téléphone</h3>
                        <p className="text-neutral-600">+224 662 662 958</p>
                        <p className="text-sm text-neutral-500 mt-1">Lun - Sam: 9h - 18h</p>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 mb-1">WhatsApp</h3>
                        <p className="text-neutral-600">+224 662 662 958</p>
                        <a 
                          href="https://wa.me/224662662958" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:underline mt-1 inline-block"
                        >
                          Envoyer un message →
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 mb-1">Email</h3>
                        <p className="text-neutral-600">contact@grandson.com</p>
                        <p className="text-sm text-neutral-500 mt-1">Réponse sous 24h</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 mb-1">Adresse</h3>
                        <p className="text-neutral-600">Conakry, Guinée</p>
                        <p className="text-sm text-neutral-500 mt-1">Livraison dans toute la ville</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media - Enhanced with modern design */}
                <div className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800 rounded-2xl p-8 border-2 border-accent/30 shadow-2xl relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent to-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-black text-white">
                        Rejoignez Notre Communauté
                      </h2>
                    </div>
                    
                    <p className="text-neutral-300 mb-8 leading-relaxed">
                      Suivez-nous sur les réseaux sociaux pour découvrir nos nouveautés, promotions exclusives et inspirations mode !
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Facebook */}
                      <a 
                        href="https://facebook.com/votre-page" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                          <span className="text-white font-bold text-lg mb-1">Facebook</span>
                          <span className="text-blue-100 text-sm opacity-90">@grandson</span>
                        </div>
                      </a>

                      {/* Instagram */}
                      <a 
                        href="https://instagram.com/votre-compte" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500 rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                          <span className="text-white font-bold text-lg mb-1">Instagram</span>
                          <span className="text-pink-100 text-sm opacity-90">@grandson</span>
                        </div>
                      </a>

                      {/* TikTok */}
                      <a 
                        href="https://tiktok.com/@votre-compte" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 overflow-hidden border-2 border-cyan-400/50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                          </div>
                          <span className="text-white font-bold text-lg mb-1">TikTok</span>
                          <span className="text-cyan-100 text-sm opacity-90">@grandson</span>
                        </div>
                      </a>

                      {/* WhatsApp Community */}
                      <a 
                        href="https://wa.me/224662662958" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </div>
                          <span className="text-white font-bold text-lg mb-1">WhatsApp</span>
                          <span className="text-green-100 text-sm opacity-90">Rejoindre</span>
                        </div>
                      </a>
                    </div>

                    {/* Call to action */}
                    <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <p className="text-center text-neutral-300 text-sm">
                        <span className="text-accent font-bold">+5K</span> personnes nous suivent déjà ! 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form - Enhanced */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-neutral-100 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-green-500 to-accent"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900">
                    Envoyez-nous un message
                  </h2>
                </div>
                
                {submitted && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-green-800 font-semibold">
                      ✓ Message envoyé avec succès ! Nous vous répondrons bientôt.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="+224 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Sujet *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="commande">Question sur une commande</option>
                      <option value="produit">Information produit</option>
                      <option value="livraison">Livraison</option>
                      <option value="retour">Retour / Échange</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                      placeholder="Écrivez votre message ici..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full bg-gradient-to-r from-black via-neutral-900 to-black hover:from-accent hover:via-green-500 hover:to-accent text-white py-5 rounded-xl font-black text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <span>Envoyer le message</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-white/20 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
