'use client';

import { useState, useEffect } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function RippleEffect({ children, className = '', onClick }: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={createRipple}
    >
      {children}
      
      {/* Ripple animations */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-0 h-0 bg-accent/30 rounded-full animate-ripple"></div>
        </div>
      ))}
    </div>
  );
}