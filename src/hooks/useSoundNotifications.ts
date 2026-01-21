import { useCallback, useRef, useEffect } from "react";

interface UseSoundNotificationsOptions {
  enabled?: boolean;
}

export const useSoundNotifications = ({ enabled = true }: UseSoundNotificationsOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Try to initialize on any user interaction
    const handleInteraction = () => {
      initAudioContext();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!enabled) return;

    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [enabled]);

  // New trip request sound - attention-grabbing
  const playNewRequestSound = useCallback(() => {
    if (!enabled) return;

    // Play a series of ascending tones
    setTimeout(() => playSound(600, 0.15, "sine"), 0);
    setTimeout(() => playSound(800, 0.15, "sine"), 150);
    setTimeout(() => playSound(1000, 0.2, "sine"), 300);
    setTimeout(() => playSound(600, 0.15, "sine"), 600);
    setTimeout(() => playSound(800, 0.15, "sine"), 750);
    setTimeout(() => playSound(1000, 0.2, "sine"), 900);
  }, [enabled, playSound]);

  // Message notification sound
  const playMessageSound = useCallback(() => {
    if (!enabled) return;
    playSound(880, 0.1, "sine");
    setTimeout(() => playSound(1100, 0.15, "sine"), 100);
  }, [enabled, playSound]);

  // Success sound
  const playSuccessSound = useCallback(() => {
    if (!enabled) return;
    playSound(523, 0.1, "sine");
    setTimeout(() => playSound(659, 0.1, "sine"), 100);
    setTimeout(() => playSound(784, 0.15, "sine"), 200);
  }, [enabled, playSound]);

  // Alert/Warning sound
  const playAlertSound = useCallback(() => {
    if (!enabled) return;
    playSound(400, 0.2, "square");
    setTimeout(() => playSound(300, 0.3, "square"), 250);
  }, [enabled, playSound]);

  // Generic notification beep
  const playBeep = useCallback(() => {
    if (!enabled) return;
    playSound(800, 0.2, "sine");
  }, [enabled, playSound]);

  return {
    playNewRequestSound,
    playMessageSound,
    playSuccessSound,
    playAlertSound,
    playBeep,
    playSound,
  };
};
