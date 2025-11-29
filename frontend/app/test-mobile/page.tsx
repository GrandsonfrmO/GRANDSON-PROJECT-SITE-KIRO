'use client';

import { useState } from 'react';
import { useIsMobile, useDeviceInfo, useViewportHeight } from '../hooks/useIsMobile';
import { useInteractiveButton, useHapticFeedback } from '../hooks/useHapticFeedback';

import TouchFeedback from '../components/TouchFeedback';
import MobileOptimizedImage from '../components/MobileOptimizedImage';
import MobileLoadingSpinner from '../components/MobileLoadingSpinner';
import MobileGestureHandler from '../components/MobileGestureHandler';

export default function TestMobilePage() {
  const [gestureLog, setGestureLog] = useState<string[]>([]);
  
  const isMobile = useIsMobile();
  const deviceInfo = useDeviceInfo();
  const viewportHeight = useViewportHeight();
  const { triggerHaptic } = useHapticFeedback();
  const { handlePress } = useInteractiveButton();



  const addGestureLog = (gesture: string) => {
    setGestureLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${gesture}`]);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-neutral-50 to-white"
    >


      <div className="container mx-auto mobile-px mobile-py">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`font-black text-neutral-900 mb-4 ${
            isMobile ? 'text-mobile-3xl' : 'text-4xl'
          }`}>
            Test Mobile Optimizations
          </h1>
          <p className={`text-neutral-600 ${
            isMobile ? 'text-mobile-base' : 'text-lg'
          }`}>
            Testez toutes les fonctionnalités mobiles
          </p>
        </div>

        {/* Device Info */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">Informations de l'appareil</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold">Mobile:</span> {deviceInfo.isMobile ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-semibold">Tablette:</span> {deviceInfo.isTablet ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-semibold">Tactile:</span> {deviceInfo.isTouchDevice ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-semibold">iOS:</span> {deviceInfo.isIOS ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-semibold">Android:</span> {deviceInfo.isAndroid ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-semibold">Largeur:</span> {deviceInfo.screenWidth}px
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Hauteur viewport:</span> {viewportHeight}px
            </div>
          </div>
        </div>

        {/* Touch Feedback Tests */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">Tests de Feedback Tactile</h2>
          <div className="grid grid-cols-2 gap-3">
            <TouchFeedback
              hapticFeedback={true}
              onClick={() => triggerHaptic('light')}
              className="bg-accent text-white rounded-mobile p-3 text-center font-semibold"
            >
              Vibration Légère
            </TouchFeedback>
            
            <TouchFeedback
              hapticFeedback={true}
              onClick={() => triggerHaptic('medium')}
              className="bg-blue-500 text-white rounded-mobile p-3 text-center font-semibold"
            >
              Vibration Moyenne
            </TouchFeedback>
            
            <TouchFeedback
              hapticFeedback={true}
              onClick={() => triggerHaptic('success')}
              className="bg-green-500 text-white rounded-mobile p-3 text-center font-semibold"
            >
              Succès
            </TouchFeedback>
            
            <TouchFeedback
              hapticFeedback={true}
              onClick={() => triggerHaptic('error')}
              className="bg-red-500 text-white rounded-mobile p-3 text-center font-semibold"
            >
              Erreur
            </TouchFeedback>
          </div>
        </div>

        {/* Gesture Handler Test */}
        <MobileGestureHandler
          onSwipeLeft={() => addGestureLog('Swipe Gauche')}
          onSwipeRight={() => addGestureLog('Swipe Droite')}
          onSwipeUp={() => addGestureLog('Swipe Haut')}
          onSwipeDown={() => addGestureLog('Swipe Bas')}
          className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6"
        >
          <h2 className="font-bold text-lg mb-3">Zone de Test des Gestes</h2>
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-mobile p-6 text-center border-2 border-dashed border-accent/30">
            <p className="text-accent font-semibold mb-2">
              Faites des gestes de swipe dans cette zone
            </p>
            <div className="text-sm text-neutral-600">
              {gestureLog.length > 0 ? (
                <div>
                  <p className="font-semibold mb-2">Derniers gestes:</p>
                  {gestureLog.map((log, index) => (
                    <p key={index} className="text-xs">{log}</p>
                  ))}
                </div>
              ) : (
                <p>Aucun geste détecté</p>
              )}
            </div>
          </div>
        </MobileGestureHandler>

        {/* Image Optimization Test */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">Test d'Images Optimisées</h2>
          <div className="grid grid-cols-2 gap-3">
            <MobileOptimizedImage
              src="https://picsum.photos/300/300?random=1"
              alt="Test Image 1"
              aspectRatio="square"
              placeholder="skeleton"
              className="rounded-mobile"
            />
            <MobileOptimizedImage
              src="https://picsum.photos/300/300?random=2"
              alt="Test Image 2"
              aspectRatio="square"
              placeholder="skeleton"
              className="rounded-mobile"
            />
          </div>
        </div>

        {/* Loading States */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">États de Chargement</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <MobileLoadingSpinner size="sm" color="accent" />
              <p className="text-xs mt-2">Petit</p>
            </div>
            <div>
              <MobileLoadingSpinner size="md" color="accent" text="Chargement..." />
              <p className="text-xs mt-2">Moyen</p>
            </div>
            <div>
              <MobileLoadingSpinner size="lg" color="accent" />
              <p className="text-xs mt-2">Grand</p>
            </div>
          </div>
        </div>



        {/* Animation Tests */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">Tests d'Animations</h2>
          <div className="space-y-3">
            <div className="bg-accent/10 p-3 rounded-mobile animate-mobile-bounce">
              <p className="text-accent font-semibold">Animation Bounce Mobile</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-mobile animate-slide-up">
              <p className="text-blue-600 font-semibold">Animation Slide Up</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-mobile animate-bounce-in">
              <p className="text-green-600 font-semibold">Animation Bounce In</p>
            </div>
          </div>
        </div>

        {/* Touch Target Tests */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4 mb-6">
          <h2 className="font-bold text-lg mb-3">Zones Tactiles</h2>
          <div className="space-y-3">
            <button 
              {...handlePress(() => {}, 'light')}
              className="w-full min-h-touch bg-accent text-white rounded-mobile font-semibold touch-target"
            >
              Zone tactile standard (44px)
            </button>
            <button 
              {...handlePress(() => {}, 'medium')}
              className="w-full min-h-touch-lg bg-blue-500 text-white rounded-mobile font-semibold touch-target"
            >
              Zone tactile large (48px)
            </button>
            <button 
              {...handlePress(() => {}, 'heavy')}
              className="w-full min-h-touch-xl bg-green-500 text-white rounded-mobile font-semibold touch-target"
            >
              Zone tactile extra-large (52px)
            </button>
          </div>
        </div>

        {/* Performance Info */}
        <div className="bg-white rounded-mobile-lg shadow-mobile p-4">
          <h2 className="font-bold text-lg mb-3">Informations de Performance</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span className="text-xs text-right max-w-[200px] truncate">
                {navigator.userAgent}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connexion:</span>
              <span>
                {(navigator as any).connection?.effectiveType || 'Inconnue'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mémoire:</span>
              <span>
                {(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'Inconnue'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cores CPU:</span>
              <span>
                {navigator.hardwareConcurrency || 'Inconnu'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}