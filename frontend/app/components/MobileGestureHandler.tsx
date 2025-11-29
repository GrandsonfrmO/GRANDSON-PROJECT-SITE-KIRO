'use client';

import { useEffect, useRef } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface MobileGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

export default function MobileGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = ''
}: MobileGestureHandlerProps) {
  const swipeRef = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold: 50
  });

  return (
    <div
      ref={swipeRef as React.RefObject<HTMLDivElement>}
      className={`touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
}