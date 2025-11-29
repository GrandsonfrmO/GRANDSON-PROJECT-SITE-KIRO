'use client';

import { useEffect, useState } from 'react';

interface DeviceInfo {
  type: string;
  os: string;
  browser: string;
  isMobile: boolean;
  screenSize: string;
}

export default function DeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    
    // Détecter le type d'appareil
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    
    let type = 'Desktop';
    if (/iPhone/i.test(ua)) type = 'iPhone';
    else if (/iPad/i.test(ua)) type = 'iPad';
    else if (/Android/i.test(ua) && /Mobile/i.test(ua)) type = 'Android Mobile';
    else if (/Android/i.test(ua)) type = 'Android Tablet';
    else if (isTablet) type = 'Tablet';
    else if (isMobile) type = 'Mobile';
    
    // Détecter l'OS
    let os = 'Unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    
    // Détecter le navigateur
    let browser = 'Unknown';
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Edge/i.test(ua)) browser = 'Edge';
    else if (/Opera|OPR/i.test(ua)) browser = 'Opera';
    
    // Taille d'écran
    const screenSize = `${window.innerWidth}x${window.innerHeight}`;
    
    setDeviceInfo({
      type,
      os,
      browser,
      isMobile,
      screenSize
    });
  }, []);

  if (!deviceInfo) return null;

  return (
    <div className="relative">
      {/* Bouton pour afficher/masquer */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
        title="Informations de l'appareil"
      >
        <span className="text-lg">
          {deviceInfo.isMobile ? '📱' : '🖥️'}
        </span>
        <span className="hidden sm:inline">{deviceInfo.type}</span>
      </button>

      {/* Panneau d'informations */}
      {isVisible && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Informations Appareil</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-semibold text-gray-900">{deviceInfo.type}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">OS:</span>
              <span className="font-semibold text-gray-900">{deviceInfo.os}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Navigateur:</span>
              <span className="font-semibold text-gray-900">{deviceInfo.browser}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Écran:</span>
              <span className="font-semibold text-gray-900">{deviceInfo.screenSize}</span>
            </div>
            
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${deviceInfo.isMobile ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                <span className="text-xs text-gray-600">
                  {deviceInfo.isMobile ? 'Mode Mobile' : 'Mode Desktop'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
