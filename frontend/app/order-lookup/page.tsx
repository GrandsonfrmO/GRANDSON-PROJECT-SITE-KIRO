'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';

export default function OrderLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('Veuillez entrer un numéro de commande');
      return;
    }

    // Navigate to order confirmation page
    router.push(`/order-confirmation/${orderNumber.trim()}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Suivre Ma Commande
            </h1>
            <p className="text-lg text-neutral-600">
              Entrez votre numéro de commande pour voir les détails et le statut en temps réel
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="orderNumber" className="block text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
                Numéro de Commande
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="GRP-20241105-1234"
                  className={`w-full px-6 py-4 border-2 rounded-xl text-lg font-mono focus:ring-4 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all ${
                    error ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              <p className="text-sm text-neutral-500 mt-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Format: GRP-AAAAMMJJ-XXXX
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl active:scale-98"
            >
              🔍 Rechercher Ma Commande
            </button>
          </form>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">
                    Où trouver mon numéro ?
                  </h3>
                  <p className="text-sm text-blue-800">
                    Votre numéro de commande vous a été fourni après la confirmation. 
                    Il commence par &quot;GRP-&quot; suivi de la date.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-green-900 mb-2">
                    Besoin d&apos;aide ?
                  </h3>
                  <p className="text-sm text-green-800 mb-2">
                    Contactez-nous pour toute question sur votre commande.
                  </p>
                  <a href="tel:+224662662958" className="text-sm font-semibold text-green-700 hover:text-green-900">
                    📞 +224 662 662 958
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
