'use client';

import React, { useState } from 'react';

interface PromoCodeInputProps {
  orderAmount: number;
  onPromoApplied: (discount: number, code: string) => void;
  onPromoRemoved: () => void;
}

export default function PromoCodeInput({ 
  orderAmount, 
  onPromoApplied, 
  onPromoRemoved 
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  const validatePromoCode = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code promo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/marketing/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          orderAmount
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setAppliedPromo(data.data);
      onPromoApplied(data.data.discountAmount, code.toUpperCase());
      setCode('');
    } catch (err: any) {
      setError('Erreur lors de la validation du code');
    } finally {
      setLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setError('');
    onPromoRemoved();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-3">
      {!appliedPromo ? (
        <div>
          <label className="block text-white/80 mb-2 text-sm font-semibold">
            Code Promo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Entrez votre code"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-accent focus:outline-none uppercase"
              disabled={loading}
            />
            <button
              onClick={validatePromoCode}
              disabled={loading || !code.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? '...' : 'Appliquer'}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="glass-secondary rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-white font-bold">Code appliqué: {appliedPromo.promoCode.code}</p>
                <p className="text-white/70 text-sm">{appliedPromo.promoCode.description}</p>
              </div>
            </div>
            <button
              onClick={removePromo}
              className="text-white/60 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-white/80 text-sm">Réduction</span>
            <span className="text-green-400 font-bold">
              -{formatPrice(appliedPromo.discountAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
