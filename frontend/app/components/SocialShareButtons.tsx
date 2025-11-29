'use client';

import React from 'react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  productId?: string;
}

export default function SocialShareButtons({ 
  url, 
  title, 
  description = '',
  productId 
}: SocialShareButtonsProps) {
  
  const shareText = `${title}\n${description}`;

  const recordShare = async (platform: string) => {
    try {
      await fetch('/api/marketing/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          contentType: 'product',
          contentId: productId,
          shareUrl: url
        })
      });
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  const shareOnPlatform = (platform: string, shareUrl: string) => {
    recordShare(platform);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const platforms = [
    {
      name: 'Facebook',
      icon: '📘',
      color: 'from-blue-600 to-blue-700',
      onClick: () => shareOnPlatform(
        'facebook',
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`
      )
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'from-sky-500 to-sky-600',
      onClick: () => shareOnPlatform(
        'twitter',
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
      )
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'from-green-500 to-green-600',
      onClick: () => shareOnPlatform(
        'whatsapp',
        `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`
      )
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'from-blue-400 to-blue-500',
      onClick: () => shareOnPlatform(
        'telegram',
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
      )
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('✅ Lien copié !');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-white font-semibold text-sm">Partager ce produit</h4>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={platform.onClick}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${platform.color} text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold`}
            title={`Partager sur ${platform.name}`}
          >
            <span>{platform.icon}</span>
            <span className="hidden sm:inline">{platform.name}</span>
          </button>
        ))}
        
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 glass-secondary text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold border border-white/20"
          title="Copier le lien"
        >
          <span>📋</span>
          <span className="hidden sm:inline">Copier</span>
        </button>
      </div>
    </div>
  );
}
