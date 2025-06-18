import type React from 'react';
import { useState } from 'react';
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
      title="Configurazione"
      maxWidth="max-w-md"
      cancelButton={{
        text: hasValidReadingSpeed ? "Rifai Test Velocità" : "Fai Prima il Test di Velocità",
        onClick: handleRetakeTest
      }}
      actionButton={{
        text: "Inizia a Leggere",
        onClick: handleStartReading,
        icon: <PlayIcon size={16} />
      }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold select-none">Pronto per Iniziare a Leggere?</h2>
          <p className="text-muted-foreground text-sm select-none">
            Hai configurato una sessione di lettura cronometrata
          </p>
        </div>

        {/* Reading Session Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium select-none">Tempo di Lettura:</span>
            <span className="text-sm font-medium select-none">{timerMinutes} minuti</span>
          </div>

          {hasValidReadingSpeed && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium select-none">La Tua Velocità di Lettura:</span>
                <span className="text-sm font-medium select-none">{readingSpeed.averageWpm} PPM</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium select-none">Pagine Stimate:</span>
                <span className="text-sm font-medium select-none">~{estimatedPages} pagine</span>
              </div>
            </>
          )}

          {!hasValidReadingSpeed && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-lg">
              <p className="text-sm text-orange-800 select-none">
                <strong>Nessun dato sulla velocità di lettura trovato.</strong> Fai un test di velocità per ottenere stime personalizzate.
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
                Divisione automatica pagine
              </Label>
              <p className="text-xs text-muted-foreground select-none">
                {hasValidReadingSpeed 
                  ? "Dividi automaticamente le pagine del documento in base alla tua velocità di lettura"
                  : "Richiede dati sulla velocità di lettura (fai prima il test di velocità)"
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
      </div>
    </Modal>
  );
};

export default TimerWelcomeModal; 