'use client';

import React, { useState } from 'react';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/marketing/newsletter/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, phone })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess(true);
      setEmail('');
      setName('');
      setPhone('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-primary rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-white text-2xl font-bold mb-2">Merci de votre inscription !</h3>
        <p className="text-white/70">
          Vous recevrez bientôt nos dernières actualités et offres exclusives.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-primary rounded-3xl p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📧</div>
        <h3 className="text-white text-2xl font-bold mb-2">Restez informé</h3>
        <p className="text-white/70">
          Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Votre téléphone (optionnel)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-accent focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-accent to-green-500 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? 'Inscription...' : "S'inscrire à la newsletter"}
        </button>

        <p className="text-white/50 text-xs text-center">
          En vous inscrivant, vous acceptez de recevoir nos communications marketing.
          Vous pouvez vous désabonner à tout moment.
        </p>
      </form>
    </div>
  );
}
