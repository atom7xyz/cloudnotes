import { Modal } from "../ui/modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type React from "react";
import { useState, useEffect } from "react";
import { BookOpenIcon, SearchIcon, UploadIcon, GraduationCapIcon, BriefcaseIcon, ChevronRightIcon, ArrowRightToLineIcon } from "lucide-react";

// Import demo images
import giuseppeVerdi from "../../assets/giuseppe_verdi.jpg";
import michelangelo from "../../assets/michelangelo.jpg";
import readerDemo from "../../assets/reader_demo.png";
import uploadDemo from "../../assets/upload_demo.PNG";
import searchDemo from "../../assets/search_demo.PNG";
import yourDocumentsDemo from "../../assets/your_documents_demo.PNG";

/**
 * Props for the WelcomeModal component
 */
export interface WelcomeModalProps {
  /** Whether the welcome modal is currently visible */
  isOpen: boolean;
  /** Function to call when the modal should close */
  onClose: () => void;
  /** Function to call when the user completes the welcome flow */
  onComplete: () => void;
}

type WelcomeStage = "intro" | "search" | "upload" | "reader" | "library" | "final";

/**
 * WelcomeModal - A multi-stage onboarding modal for new users
 * 
 * This component provides an engaging introduction to CloudNotes, showcasing:
 * - Application purpose and target audience
 * - Key features (search, upload, reading, personal library)
 * - Enhanced reading experience details
 * - Final encouragement to start learning
 * 
 * @example
 * ```tsx
 * const [showWelcome, setShowWelcome] = useState(true);
 * 
 * <WelcomeModal
 *   isOpen={showWelcome}
 *   onClose={() => setShowWelcome(false)}
 *   onComplete={() => {
 *     setShowWelcome(false);
 *     // Mark user as onboarded
 *     localStorage.setItem('hasSeenWelcome', 'true');
 *   }}
 * />
 * ```
 */
const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<WelcomeStage>("intro");

  // Reset to first stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage("intro");
    }
  }, [isOpen]);

  const handleNext = () => {
    switch (stage) {
      case "intro":
        setStage("search");
        break;
      case "search":
        setStage("upload");
        break;
      case "upload":
        setStage("reader");
        break;
      case "reader":
        setStage("library");
        break;
      case "library":
        setStage("final");
        break;
      case "final":
        onComplete();
        onClose();
        break;
    }
  };

  const getButtonText = () => {
    switch (stage) {
      case "final":
        return "Inizia il tuo viaggio";
      default:
        return "Avanti";
    }
  };

  const getButtonIcon = () => {
    switch (stage) {
      case "final":
        return <ArrowRightToLineIcon size={16} />;
      default:
        return <ChevronRightIcon size={16} />;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 select-none">
          <BookOpenIcon size={20} />
          <span>Benvenuto in CloudNotes</span>
        </div>
      }
      maxWidth="max-w-6xl"
      className="overflow-hidden min-h-[800px]"
      actionButton={{
        text: getButtonText(),
        onClick: handleNext,
        icon: getButtonIcon()
      }}
    >
      <div className="p-6 h-[750px] flex flex-col">
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="w-full">
        {/* Introduction Stage */}
        {stage === "intro" && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                Benvenuto in CloudNotes
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Questa applicazione è per tutti coloro che vogliono imparare ed esplorare il catalogo di documenti creati da altri utenti. Dalla scuola alle carriere, CloudNotes aiuta a trovare e leggere facilmente documenti di ogni tipo — gratuitamente!
              </p>
            </div>

                <div className="grid grid-cols-2 gap-8 mt-8 w-10/12 mx-auto">
              <div className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="overflow-hidden rounded-xl cursor-pointer">
                  <img 
                    src={giuseppeVerdi} 
                    alt="Giuseppe Verdi" 
                            className="w-full h-80 object-contain"
                  />
                </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Giuseppe Verdi</p>
                        <p className="text-xs text-muted-foreground">Italian composer</p>
                      </TooltipContent>
                    </Tooltip>
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <GraduationCapIcon size={16} />
                    <span className="text-sm font-medium">Apprendimento Accademico</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Esplora documenti storici e contenuti educativi
                  </p>
                </div>
              </div>

              <div className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="overflow-hidden rounded-xl cursor-pointer">
                  <img 
                    src={michelangelo} 
                    alt="Michelangelo" 
                            className="w-full h-80 object-contain"
                  />
                </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Michelangelo</p>
                        <p className="text-xs text-muted-foreground">Italian sculptor and painter</p>
                      </TooltipContent>
                    </Tooltip>
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <BriefcaseIcon size={16} />
                    <span className="text-sm font-medium">Crescita Professionale</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accedi a risorse per la carriera e documenti professionali
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Search Stage */}
            {stage === "search" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                    Ricerca Intelligente
              </h2>
              <p className="text-lg text-muted-foreground">
                    Trova esattamente quello che stai cercando
              </p>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border shadow-lg">
                    <img 
                      src={searchDemo} 
                        alt="Search Interface" 
                        className="w-full h-108 object-cover object-top"
                    />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Funzionalità di Ricerca
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Filtri Avanzati</p>
                            <p className="text-xs text-muted-foreground">Filtra per tipo di documento, argomento e data</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Risultati Istantanei</p>
                            <p className="text-xs text-muted-foreground">Ottieni risultati mentre digiti con la ricerca in tempo reale</p>
                  </div>
                </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Ricerca nel Contenuto</p>
                            <p className="text-xs text-muted-foreground">Cerca all'interno del contenuto dei documenti, non solo nei titoli</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Suggerimenti Intelligenti</p>
                            <p className="text-xs text-muted-foreground">Ottieni suggerimenti di ricerca intelligenti e raccomandazioni</p>
                          </div>
                        </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Stage */}
            {stage === "upload" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    Caricamento Facile
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Condividi i tuoi documenti con la community
                  </p>
              </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border shadow-lg">
                      <img 
                        src={uploadDemo} 
                        alt="Upload Interface" 
                        className="w-full h-130 object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Funzionalità di Caricamento
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Formati Multipli</p>
                            <p className="text-xs text-muted-foreground">Supporto per PDF, EPUB, Word, PowerPoint e TXT</p>
                  </div>
                </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Sistema di Tag</p>
                            <p className="text-xs text-muted-foreground">Etichetta i tuoi documenti con parole chiave e categorie per renderli più facili da trovare</p>
                          </div>
                        </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Reader Stage */}
            {stage === "reader" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                    Lettore Integrato
              </h2>
              <p className="text-lg text-muted-foreground">
                    Esperienza avanzata di visualizzazione documenti
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-xl border shadow-lg">
                  <img 
                    src={readerDemo} 
                    alt="Reader Interface" 
                        className="w-full h-128 object-cover object-center"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                        Funzionalità del Lettore
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Zoom e Panoramica</p>
                            <p className="text-xs text-muted-foreground">Zoom e panoramica fluidi per una visualizzazione dettagliata</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Disegna ed Evidenzia</p>
                            <p className="text-xs text-muted-foreground">Evidenzia il testo e disegna sui documenti</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Note e Segnalibri</p>
                            <p className="text-xs text-muted-foreground">Aggiungi note e segnalibri alle pagine</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Annulla-Ripeti</p>
                            <p className="text-xs text-muted-foreground">Annulla e ripeti le tue azioni</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Personalizzazione</p>
                            <p className="text-xs text-muted-foreground">Personalizza la tua esperienza di lettura con diversi temi per i documenti</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Library Stage */}
            {stage === "library" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    Biblioteca Personale
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Organizza e gestisci la tua collezione di documenti
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border shadow-lg">
                      <img 
                        src={yourDocumentsDemo} 
                        alt="Library Interface" 
                        className="w-full h-108 object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Funzionalità della Biblioteca
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Salva nei Preferiti</p>
                            <p className="text-xs text-muted-foreground">Salva e accedi rapidamente ai tuoi documenti preferiti</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Cronologia Recente</p>
                            <p className="text-xs text-muted-foreground">Tieni traccia dei documenti visualizzati di recente</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Controlli Privacy</p>
                            <p className="text-xs text-muted-foreground">Scegli chi può accedere ai tuoi documenti condivisi</p>
                          </div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Stage */}
        {stage === "final" && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-6xl font-bold text-foreground font-bigshot-one italic">
                      CloudNotes
              </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      la tua oasi virtuale di conoscenza.
              </p>
            </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/5 via-green-500/5 to-orange-500/5 p-8 pt-12 border border-green-500/20 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <SearchIcon size={24} className="text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Scopri</h3>
                      <p className="text-sm text-muted-foreground">
                        Cerca tra migliaia di documenti e trova esattamente quello di cui hai bisogno
                      </p>
              </div>
              
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <BookOpenIcon size={24} className="text-green-500" />
                </div>
                      <h3 className="text-lg font-semibold">Impara</h3>
                      <p className="text-sm text-muted-foreground">
                        Usa il nostro lettore avanzato per studiare e prendere appunti su qualsiasi documento
                      </p>
              </div>
              
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon size={24} className="text-orange-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Condividi</h3>
                      <p className="text-sm text-muted-foreground">
                        Contribuisci alla community condividendo i tuoi documenti
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;