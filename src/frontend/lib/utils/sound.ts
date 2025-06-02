import correctAnswerSound from '../../assets/sounds/mixkit-correct-answer-tone-2870.wav';

// Global audio instance
let audioInstance: HTMLAudioElement | null = null;

// Initialize audio instance
const initializeAudio = () => {
  if (!audioInstance) {
    audioInstance = new Audio(correctAnswerSound);
  }
  return audioInstance;
};

/**
 * Plays the notification sound effect.
 * This function can be called from anywhere in the application.
 * It handles audio initialization and error handling automatically.
 * 
 * @example
 * ```typescript
 * import { playSound } from '@/lib/utils/sound';
 * 
 * // Play sound on success
 * const handleSuccess = () => {
 *   playSound(true);
 *   toast.success("Action completed!");
 * };
 * ```
 */
export const playSound = (soundEnabled: boolean) => {
  if (!soundEnabled) return;
  try {
    const audio = initializeAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Silently handle error playing sound
    });
  } catch (error) {
    // Silently handle any initialization errors
  }
};

/**
 * Cleans up the audio instance.
 * Useful for cleanup when the application is unmounting.
 */
export const cleanupAudio = () => {
  if (audioInstance) {
    audioInstance.pause();
    audioInstance = null;
  }
};

/**
 * Returns the current audio instance for advanced usage.
 * @returns The HTMLAudioElement instance or null if not initialized
 */
export const getAudioInstance = () => audioInstance; 