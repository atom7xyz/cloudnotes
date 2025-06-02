import correctAnswerSound from '../../assets/sounds/mixkit-correct-answer-tone-2870.wav';

/**
 * Static sound manager class that handles audio playback and sound enabled state.
 * This allows you to control sound settings globally without passing props everywhere.
 */
class SoundManager {
  private static instance: SoundManager;
  private audioInstance: HTMLAudioElement | null = null;
  private soundEnabled: boolean = true; // Default to enabled

  private constructor() {}

  /**
   * Get the singleton instance of SoundManager
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize audio instance if not already created
   */
  private initializeAudio(): HTMLAudioElement {
    if (!this.audioInstance) {
      this.audioInstance = new Audio(correctAnswerSound);
    }
    return this.audioInstance;
  }

  /**
   * Set whether sound effects are enabled globally
   */
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Get the current sound enabled state
   */
  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Play the notification sound if sound is enabled
   */
  public playSound(): void {
    if (!this.soundEnabled) return;
    
    try {
      const audio = this.initializeAudio();
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently handle error playing sound
      });
    } catch (error) {
      // Silently handle any initialization errors
    }
  }

  /**
   * Cleanup audio instance
   */
  public cleanup(): void {
    if (this.audioInstance) {
      this.audioInstance.pause();
      this.audioInstance = null;
    }
  }

  /**
   * Get the audio instance for advanced usage
   */
  public getAudioInstance(): HTMLAudioElement | null {
    return this.audioInstance;
  }
}

// Get the singleton instance
const soundManager = SoundManager.getInstance();

/**
 * Plays the notification sound effect if sound is enabled.
 * This function can be called from anywhere in the application.
 * No need to pass soundEnabled as a parameter - it's managed globally.
 * 
 * @example
 * ```typescript
 * import { playSound, setSoundEnabled } from '@/lib/utils/sound';
 * 
 * // In settings, control sound globally
 * const handleSoundToggle = (enabled: boolean) => {
 *   setSoundEnabled(enabled);
 *   // Now all playSound() calls will respect this setting
 * };
 * 
 * // Anywhere in the app - just call playSound()
 * const handleSuccess = () => {
 *   playSound(); // Will only play if sound is enabled globally
 *   toast.success("Action completed!");
 * };
 * ```
 */
export const playSound = () => {
  soundManager.playSound();
};

/**
 * Set whether sound effects are enabled globally.
 * Call this from your settings to control sound for the entire app.
 * 
 * @param enabled - Whether sound effects should be enabled
 * 
 * @example
 * ```typescript
 * import { setSoundEnabled } from '@/lib/utils/sound';
 * 
 * // In settings modal
 * const handleSoundToggle = (enabled: boolean) => {
 *   setSoundEnabled(enabled);
 *   // Sound is now enabled/disabled globally
 * };
 * ```
 */
export const setSoundEnabled = (enabled: boolean) => {
  soundManager.setSoundEnabled(enabled);
};

/**
 * Get the current sound enabled state.
 * 
 * @returns Whether sound effects are currently enabled
 */
export const isSoundEnabled = () => {
  return soundManager.isSoundEnabled();
};

/**
 * Cleans up the audio instance.
 * Useful for cleanup when the application is unmounting.
 */
export const cleanupAudio = () => {
  soundManager.cleanup();
};

/**
 * Returns the current audio instance for advanced usage.
 * @returns The HTMLAudioElement instance or null if not initialized
 */
export const getAudioInstance = () => {
  return soundManager.getAudioInstance();
}; 