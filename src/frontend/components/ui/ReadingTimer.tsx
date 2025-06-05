import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "./button";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { 
  TimerIcon, 
  PlayIcon, 
  PauseIcon, 
  SettingsIcon,
  ZapIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  OctagonPause,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { useReadingSpeed } from '@/lib/contexts/ReadingSpeedContext';
import { toast } from 'sonner';
import { playSound } from '@/lib/utils/sound';

interface ReadingTimerProps {
  isActive: boolean;
  initialDuration?: number; // in minutes
  onTimerComplete?: () => void;
  onTimerStop?: () => void;
  onDurationChange?: (newDurationMinutes: number) => void;
  className?: string;
  documentWordCount?: number;
  documentType?: 'technical' | 'literary' | 'general';
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed' | 'warning';

const ReadingTimer: React.FC<ReadingTimerProps> = ({
  isActive,
  initialDuration = 30,
  onTimerComplete,
  onTimerStop,
  onDurationChange,
  className,
  documentWordCount,
  documentType = 'general'
}) => {
  const { readingSpeed, estimateReadingTime, getOptimalTimerDuration, hasValidReadingSpeed } = useReadingSpeed();
  
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60); // in seconds
  const [totalTime, setTotalTime] = useState(initialDuration * 60);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // Get timer color based on remaining time
  const getTimerColor = useCallback((): string => {
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage <= 10) return 'text-red-600';
    if (percentage <= 25) return 'text-orange-600';
    return 'text-primary';
  }, [timeRemaining, totalTime]);

  // Get timer badge variant
  const getTimerBadgeVariant = useCallback(() => {
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage <= 10) return 'destructive';
    if (percentage <= 25) return 'secondary';
    return 'default';
  }, [timeRemaining, totalTime]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerState === 'idle') {
      setTotalTime(initialDuration * 60);
      setTimeRemaining(initialDuration * 60);
    }
    
    setTimerState('running');
    warningShownRef.current = false;

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setTimerState('completed');
          onTimerComplete?.();
          toast.success("Reading time completed!", {
            description: "And... Done! You've reached your reading goal.",
            icon: <CheckCircleIcon size={16} />,
          });
          playSound();

          return 0;
        }

        // Show warning at 2 minutes remaining
        if (prev === 120 && !warningShownRef.current) {
          setTimerState('warning');
          warningShownRef.current = true;
          toast.warning("2 minutes remaining", {
            description: "",
            icon: <AlertTriangleIcon size={16} />,
          });
        }

        return prev - 1;
      });
    }, 1000);
  }, [timerState, initialDuration, onTimerComplete]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState('paused');
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (timerState === 'paused') {
      startTimer();
    }
  }, [timerState, startTimer]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState('idle');
    setTimeRemaining(initialDuration * 60);
    setTotalTime(initialDuration * 60);
    warningShownRef.current = false;
    setShowStopConfirm(false);
    onTimerStop?.();
  }, [initialDuration, onTimerStop]);

  // Reset timer duration
  const resetTimer = useCallback((newDurationMinutes: number) => {
    stopTimer();
    setTimeRemaining(newDurationMinutes * 60);
    setTotalTime(newDurationMinutes * 60);
    onDurationChange?.(newDurationMinutes);
  }, [stopTimer, onDurationChange]);

  // Get estimated reading time for current document
  const getEstimatedTime = useCallback(() => {
    if (!documentWordCount || !hasValidReadingSpeed) return null;
    return estimateReadingTime(documentWordCount, documentType);
  }, [documentWordCount, documentType, estimateReadingTime, hasValidReadingSpeed]);

  // Get optimal timer duration
  const getOptimalDuration = useCallback(() => {
    if (!documentWordCount || !hasValidReadingSpeed) return null;
    return getOptimalTimerDuration(documentWordCount, documentType);
  }, [documentWordCount, documentType, getOptimalTimerDuration, hasValidReadingSpeed]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset when isActive changes and auto-start timer
  useEffect(() => {
    if (!isActive) {
      stopTimer();
    } else if (isActive && timerState === 'idle') {
      // Auto-start the timer when it becomes active
      startTimer();
    }
  }, [isActive, stopTimer, timerState, startTimer]);

  if (!isActive) {
    return null;
  }

  const estimatedTime = getEstimatedTime();
  const optimalDuration = getOptimalDuration();

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Timer Display */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <TimerIcon size={16} className={getTimerColor()} />
            <Badge variant={getTimerBadgeVariant()} className="font-mono">
              {formatTime(timeRemaining)}
            </Badge>
          </div>

          {/* Progress Bar (shown when timer is active) */}
          {timerState !== 'idle' && (
            <div className="w-20 h-1">
              <Progress 
                value={progressPercentage} 
                className={cn(
                  "h-1",
                  timerState === 'warning' && "bg-orange-200",
                  timerState === 'completed' && "bg-green-200"
                )}
              />
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-1">
          {timerState === 'idle' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover-primary-effect"
                  onClick={startTimer}
                >
                  <PlayIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start</p>
              </TooltipContent>
            </Tooltip>
          )}

          {timerState === 'running' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover-primary-effect"
                  onClick={pauseTimer}
                >
                  <PauseIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pause</p>
              </TooltipContent>
            </Tooltip>
          )}

          {timerState === 'paused' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover-primary-effect"
                  onClick={resumeTimer}
                >
                  <PlayIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resume</p>
              </TooltipContent>
            </Tooltip>
          )}

          {(timerState === 'running' || timerState === 'paused' || timerState === 'warning') && (
            <DropdownMenu open={showStopConfirm} onOpenChange={setShowStopConfirm}>
              <DropdownMenuTrigger asChild>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover-primary-effect"
                      >
                        <X size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stop</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Stop Timer?</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={stopTimer}
                  className="text-red-600 focus:text-red-600 hover-primary-effect"
                >
                  Confirm
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowStopConfirm(false)} className="hover-primary-effect">
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {timerState === 'completed' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-green-600 hover-primary-effect"
                  onClick={stopTimer}
                >
                  <CheckCircleIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset timer</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Timer Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover-primary-effect">
                    <SettingsIcon size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Timer settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center gap-2 select-none">
              <TimerIcon size={16} />
              Reading Timer Settings
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Quick Duration Settings */}
            <div className="p-2">
              <div className="text-sm font-medium mb-2 select-none">Set new duration</div>
              <div className="grid grid-cols-3 gap-1">
                {[5, 10, 15, 30, 45, 60].map((minutes) => (
                  <Button
                    key={minutes}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 hover-primary-effect"
                    onClick={() => resetTimer(minutes)}
                    disabled={timerState === 'running'}
                  >
                    {minutes}m
                  </Button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export default ReadingTimer; 