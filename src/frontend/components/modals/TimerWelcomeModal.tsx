import type React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  ClockIcon, 
  ZapIcon, 
  BookOpenIcon,
  PlayIcon,
  RefreshCwIcon,
  SplitIcon,
  ListIcon
} from 'lucide-react';
import { useReadingSpeed } from "@/lib/contexts/ReadingSpeedContext";

interface TimerWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerMinutes: number;
  onStartReading: () => void;
  onRetakeSpeedTest: () => void;
}

const TimerWelcomeModal: React.FC<TimerWelcomeModalProps> = ({
  isOpen,
  onClose,
  timerMinutes,
  onStartReading,
  onRetakeSpeedTest
}) => {
  const { readingSpeed, hasValidReadingSpeed } = useReadingSpeed();
  const [autoPageDivision, setAutoPageDivision] = useState(false);

  // Calculate estimated pages based on reading speed
  const calculateEstimatedPages = () => {
    if (!hasValidReadingSpeed) return 0;
    
    // Estimate 250-300 words per page (using 275 as average)
    const wordsPerPage = 275;
    const estimatedWords = readingSpeed.averageWpm * timerMinutes;
    return Math.round(estimatedWords / wordsPerPage);
  };

  const estimatedPages = calculateEstimatedPages();

  const handleStartReading = () => {
    onStartReading();
    onClose();
  };

  const handleRetakeTest = () => {
    onRetakeSpeedTest();
    // Don't close the modal here - let the parent handle the transition
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Setup"
      maxWidth="max-w-md"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold select-none">Ready to Start Reading?</h2>
          <p className="text-muted-foreground text-sm select-none">
            You've set up a timed reading session
          </p>
        </div>

        {/* Reading Session Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium select-none">Reading Time:</span>
            <span className="text-sm font-medium select-none">{timerMinutes} minutes</span>
          </div>

          {hasValidReadingSpeed && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium select-none">Your Reading Speed:</span>
                <span className="text-sm font-medium select-none">{readingSpeed.averageWpm} WPM</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium select-none">Estimated Pages:</span>
                <span className="text-sm font-medium select-none">~{estimatedPages} pages</span>
              </div>
            </>
          )}

          {!hasValidReadingSpeed && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-lg">
              <p className="text-sm text-orange-800 select-none">
                <strong>No reading speed data found.</strong> Take a speed test to get personalized estimates.
              </p>
            </div>
          )}
        </div>

        {/* Auto Page Division Option */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-page-division" className={`text-sm font-medium flex items-center gap-2 ${!hasValidReadingSpeed ? 'text-muted-foreground' : ''}`}>
                <ListIcon size={16} />
                Auto page division
              </Label>
              <p className="text-xs text-muted-foreground select-none">
                {hasValidReadingSpeed 
                  ? "Automatically divide document pages based on your reading speed"
                  : "Requires reading speed data (take the speed test first)"
                }
              </p>
            </div>
            <Switch
              id="auto-page-division"
              checked={autoPageDivision}
              onCheckedChange={setAutoPageDivision}
              disabled={!hasValidReadingSpeed}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t pt-4">
          {hasValidReadingSpeed && (
            <Button 
              variant="outline" 
              onClick={handleRetakeTest}
              className="rounded-full cursor-pointer hover-primary-effect"
            >
              <RefreshCwIcon size={16} />
              Retake Speed Test
            </Button>
          )}

          {!hasValidReadingSpeed && (
            <Button 
              variant="outline" 
              onClick={handleRetakeTest}
              className="rounded-full cursor-pointer hover-primary-effect"
            >
              <RefreshCwIcon size={16} />
              Take Speed Test First
            </Button>
          )}

          <Button 
            onClick={handleStartReading}
            className="rounded-full cursor-pointer hover:bg-primary/90"
          >
            <PlayIcon size={16} />
            Start Reading
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TimerWelcomeModal; 