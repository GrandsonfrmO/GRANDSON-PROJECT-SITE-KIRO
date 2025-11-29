'use client';

import { useState, useRef, useEffect } from 'react';

interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
  rippleColor?: string;
  onClick?: () => void;
}

export default function TouchFeedback({
  children,
  className = '',
  disabled = false,
  hapticFeedback = true,
  rippleColor = 'rgba(34, 197, 94, 0.3)',
  onClick
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (event: React.TouchStart | React.MouseEvent) => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ('touches' in event ? event.touches[0].clientX : event.clientX) - rect.left;
    const y = ('touches' in event ? event.touches[0].clientY : event.clientY) - rect.top;

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    // Call onClick handler
    onClick?.();
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    createRipple(event);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    // Only create ripple on mouse if not on touch device
    if (!('ontouchstart' in window)) {
      createRipple(event);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className} ${
        disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'
      }`}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            backgroundColor: rippleColor,
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: 'ripple 0.6s ease-out'
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}