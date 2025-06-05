import { useState, memo } from 'react';
import ReadingTimer from './ReadingTimer';

interface FloatingTimerProps {
  isActive: boolean;
  initialDuration?: number;
  onTimerComplete: () => void;
  onTimerStop: () => void;
  onDurationChange?: (newDurationMinutes: number) => void;
  isVisible?: boolean;
}

/**
 * FloatingTimer component that appears at the bottom right of the screen
 * when a reading timer is active.
 */
const FloatingTimer = memo(({ 
  isActive, 
  initialDuration, 
  onTimerComplete, 
  onTimerStop,
  onDurationChange,
  isVisible = true 
}: FloatingTimerProps) => {
  const [isHovering, setIsHovering] = useState(false);

  if (!initialDuration) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible || isHovering ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2">
        <ReadingTimer
          isActive={isActive}
          initialDuration={initialDuration}
          onTimerComplete={onTimerComplete}
          onTimerStop={onTimerStop}
          onDurationChange={onDurationChange}
        />
      </div>
    </div>
  );
});

FloatingTimer.displayName = 'FloatingTimer';

export default FloatingTimer; 