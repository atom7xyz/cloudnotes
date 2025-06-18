import { useState, useCallback, useEffect } from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { 
  SettingsIcon, 
  PaletteIcon,
  RotateCcwIcon,
  CheckIcon,
  SaveIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Toaster } from '../ui/sonner';

// Define color presets with good contrast combinations
const COLOR_PRESETS = [
  { name: 'Bianco', backgroundColor: '#ffffff', textColor: '#000000', class: 'bg-white' },
  { name: 'Grigio Chiaro', backgroundColor: '#f8f9fa', textColor: '#000000', class: 'bg-gray-50' },
  { name: 'Bianco Caldo', backgroundColor: '#fefcf3', textColor: '#000000', class: 'bg-yellow-50' },
  { name: 'Seppia', backgroundColor: '#f4f1e8', textColor: '#000000', class: 'bg-yellow-100' },
  { name: 'Blu Chiaro', backgroundColor: '#f0f9ff', textColor: '#000000', class: 'bg-blue-50' },
];

// Default settings
const DEFAULT_SETTINGS = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
};

interface FileReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: {
    backgroundColor: string;
    textColor: string;
  };
  onSettingsChange?: (settings: { backgroundColor: string; textColor: string }) => void;
}

export default function FileReaderSettingsModal({ 
  isOpen, 
  onClose, 
  currentSettings = DEFAULT_SETTINGS,
  onSettingsChange
}: FileReaderSettingsModalProps) {
  // Settings state
  const [backgroundColor, setBackgroundColor] = useState(currentSettings.backgroundColor);
  const [textColor, setTextColor] = useState(currentSettings.textColor);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Reset local state when modal opens or current settings change
  useEffect(() => {
    if (isOpen) {
      setBackgroundColor(currentSettings.backgroundColor);
      setTextColor(currentSettings.textColor);
    }
  }, [isOpen, currentSettings]);

  // Find current preset or use custom
  const getCurrentPreset = () => {
    return COLOR_PRESETS.find(preset => 
      preset.backgroundColor === backgroundColor && preset.textColor === textColor
    );
  };

  // Handle color preset selection - removed immediate onSettingsChange call
  const handleColorPresetChange = useCallback((preset: typeof COLOR_PRESETS[0]) => {
    setBackgroundColor(preset.backgroundColor);
    setTextColor(preset.textColor);
    // Remove immediate application - only apply on save
  }, []);

  // Reset to defaults
  const handleResetToDefaults = useCallback(() => {
    setBackgroundColor(DEFAULT_SETTINGS.backgroundColor);
    setTextColor(DEFAULT_SETTINGS.textColor);
    // Remove immediate application - only apply on save
  }, []);

  // Apply settings and close modal
  const handleSave = useCallback(() => {
    if (onSettingsChange) {
      onSettingsChange({ backgroundColor, textColor });
    }
    onClose();
  }, [backgroundColor, textColor, onSettingsChange, onClose]);

  // Handle cancel - reset to current settings
  const handleCancel = useCallback(() => {
    setBackgroundColor(currentSettings.backgroundColor);
    setTextColor(currentSettings.textColor);
    onClose();
  }, [currentSettings, onClose]);

  // Render preview
  const renderPreview = useCallback(() => {
    const previewBg = hoveredColor || backgroundColor;
    const previewText = hoveredColor ? 
      COLOR_PRESETS.find(p => p.backgroundColor === hoveredColor)?.textColor || textColor : 
      textColor;
    
    return (
      <div 
        className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg border transition-all duration-200"
        style={{ 
          backgroundColor: previewBg,
          color: previewText 
        }}
      >
        <div className="absolute inset-0" />
        <div className="text-center p-4 relative z-10">
          <h4 className="font-semibold text-lg mb-2">Anteprima Documento</h4>
          <p className="text-xs opacity-75">
            Passa il mouse sui colori per vedere l'anteprima del documento con i colori selezionati.
            Clicca sul colore per applicarlo.
            Clicca Salva per applicare le modifiche.
            Divertiti!
          </p>
        </div>
      </div>
    );
  }, [backgroundColor, textColor, hoveredColor]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-medium">
            <SettingsIcon size={20} />
            <span>Impostazioni</span>
          </div>
        }
        maxWidth="max-w-4xl"
        cancelButton={{
          text: "Annulla",
          onClick: handleCancel
        }}
        actionButton={{
          text: "Salva",
          onClick: handleSave,
          icon: <SaveIcon size={16} />
        }}
      >
        <div className="p-8 select-none">
          <div className="flex gap-8">
            {/* Left side - Preview */}
            <div className="flex flex-col items-center">
              <div className="w-64 h-80 rounded-lg overflow-hidden bg-muted/30 mb-4 shadow-md border border-primary/10">
                {renderPreview()}
              </div>
            </div>
            
            {/* Right side - Color selection */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PaletteIcon size={16} className="text-primary" />
                  <span className="font-medium text-lg">Colori</span>
                </div>
                
                <div className="grid grid-cols-4 gap-6">
                  {COLOR_PRESETS.map((preset) => (
                    <div 
                      key={preset.name} 
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer",
                        (preset.backgroundColor === backgroundColor && preset.textColor === textColor) 
                          ? "border-primary shadow-lg ring-2 ring-primary/20" 
                          : "border-border hover:border-primary"
                      )}
                      onClick={() => handleColorPresetChange(preset)}
                      onMouseEnter={() => setHoveredColor(preset.backgroundColor)}
                      onMouseLeave={() => setHoveredColor(null)}
                      title={preset.name}
                    >
                      <div
                        className="w-16 h-16 rounded-full border transition-all duration-200"
                        style={{ backgroundColor: preset.backgroundColor }}
                      >
                      </div>
                      <span className="text-sm font-medium mt-2 text-center">{preset.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset to defaults button moved here */}
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-2 cursor-pointer rounded-full hover-primary-effect"
                >
                  <RotateCcwIcon size={16} />
                  Ripristina Predefiniti
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Sonner Toast Container */}
      <Toaster theme="light" position="bottom-right" />
    </>
  );
} 