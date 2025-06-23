import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "./button";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { 
  TimerIcon, 
  PlayIcon, 
  PauseIcon, 
  RotateCcwIcon,
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

import { toast } from '@/lib/utils/toast';
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

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

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

  
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60); // in seconds
  const [totalTime, setTotalTime] = useState(initialDuration * 60);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  
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

  // Get timer color based on remaining time - keeping it consistent
  const getTimerColor = useCallback((): string => {
    return 'text-primary'; // Always use primary color
  }, []);

  // Get timer badge variant - keeping it consistent  
  const getTimerBadgeVariant = useCallback(() => {
    return 'default'; // Always use default variant
  }, []);

  // Shared timer tick logic
  const createTimerInterval = useCallback(() => {
    return setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Clear interval immediately to prevent multiple calls
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          setTimerState('completed');
          onTimerComplete?.();
          
          // Only show toast once when timer completes
          toast.success("Tempo di lettura completato!", {
            description: "E... fatto! Hai raggiunto il tuo obiettivo di lettura.",
            icon: <CheckCircleIcon size={16} />
          });
          playSound();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimerComplete]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerState === 'idle') {
      setTotalTime(initialDuration * 60);
      setTimeRemaining(initialDuration * 60);
    }
    
    setTimerState('running');
    warningShownRef.current = false;

    intervalRef.current = createTimerInterval();
  }, [timerState, initialDuration, createTimerInterval]);

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

  // Restart timer
  const restartTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeRemaining(initialDuration * 60);
    setTotalTime(initialDuration * 60);
    warningShownRef.current = false;
    setShowRestartConfirm(false);
    setTimerState('running');
    
    // Start the timer immediately
    intervalRef.current = createTimerInterval();

    toast.success("Timer riavviato!", {
      description: `Timer ripristinato a ${initialDuration} minuti e avviato`,
      icon: <RotateCcwIcon size={16} />
    });
  }, [initialDuration, createTimerInterval]);

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
                className="h-1"
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
                <p>Avvia</p>
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
                <p>Pausa</p>
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
                <p>Riprendi</p>
              </TooltipContent>
            </Tooltip>
          )}

          {(timerState === 'running' || timerState === 'paused') && (
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
                <DropdownMenuLabel>Fermare il timer?</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={stopTimer}
                  className="text-red-600 focus:text-red-600 hover-primary-effect"
                >
                  Conferma
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowStopConfirm(false)} className="hover-primary-effect">
                  Annulla
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
                <p>Reimposta timer</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Timer Restart Button with Confirmation */}
        {(timerState === 'running' || timerState === 'paused') && (
          <DropdownMenu open={showRestartConfirm} onOpenChange={setShowRestartConfirm}>
            <DropdownMenuTrigger asChild>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover-primary-effect">
                      <RotateCcwIcon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Riavvia timer</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Riavviare timer?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={restartTimer}
                className="text-red-600 focus:text-red-600 hover-primary-effect"
              >
                Conferma
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRestartConfirm(false)} className="hover-primary-effect">
                Annulla
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ReadingTimer; 