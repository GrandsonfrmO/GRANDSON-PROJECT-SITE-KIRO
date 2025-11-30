'use client';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useHapticFeedback() {
  const triggerHaptic = (pattern: HapticPattern = 'light') => {
    // Check if vibration API is supported
    if (!('vibrate' in navigator)) {
      return;
    }

    let vibrationPattern: number | number[];

    switch (pattern) {
      case 'light':
        vibrationPattern = 10;
        break;
      case 'medium':
        vibrationPattern = 25;
        break;
      case 'heavy':
        vibrationPattern = 50;
        break;
      case 'success':
        vibrationPattern = [50, 50, 100];
        break;
      case 'warning':
        vibrationPattern = [100, 50, 100];
        break;
      case 'error':
        vibrationPattern = [200, 100, 200];
        break;
      case 'selection':
        vibrationPattern = 15;
        break;
      default:
        vibrationPattern = 10;
    }

    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  };

  const isHapticSupported = () => {
    return 'vibrate' in navigator;
  };

  return {
    triggerHaptic,
    isHapticSupported
  };
}

// Hook for button interactions with automatic haptic feedback
export function useInteractiveButton() {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = (callback?: () => void, hapticPattern: HapticPattern = 'light') => {
    return () => {
      triggerHaptic(hapticPattern);
      callback?.();
    };
  };

  const handleLongPress = (callback?: () => void, hapticPattern: HapticPattern = 'medium') => {
    let pressTimer: NodeJS.Timeout;

    const startPress = () => {
      pressTimer = setTimeout(() => {
        triggerHaptic(hapticPattern);
        callback?.();
      }, 500); // 500ms for long press
    };

    const endPress = () => {
      clearTimeout(pressTimer);
    };

    return {
      onTouchStart: startPress,
      onTouchEnd: endPress,
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: endPress
    };
  };

  return {
    handlePress,
    handleLongPress,
    triggerHaptic
  };
}