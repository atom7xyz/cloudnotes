import type React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { 
  PlayIcon,
  RotateCcwIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  ClockIcon,
  HelpCircleIcon,
  ZapIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { toast } from '@/lib/utils/toast';
import { useReadingSpeed, type ReadingTestResult } from '@/lib/contexts/ReadingSpeedContext';

interface ReadingSpeedTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestTopic {
  id: string;
  title: string;
  type: 'technical' | 'literary' | 'general';
  content: string;
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const TEST_TOPICS: TestTopic[] = [
  {
    id: 'general-1',
    title: 'Il Futuro della Tecnologia',
    type: 'general',
    difficulty: 'medium',
    wordCount: 150,
    content: `Il rapido avanzamento della tecnologia continua a rimodellare la nostra vita quotidiana in modi senza precedenti. Dall'intelligenza artificiale che alimenta le case intelligenti al calcolo quantistico che promette soluzioni rivoluzionarie, ci troviamo sulla soglia di una nuova era. I dispositivi mobili si sono evoluti da semplici strumenti di comunicazione a potenti computer che entrano nelle nostre tasche. Il cloud computing ha rivoluzionato il modo in cui archiviamo e accediamo alle informazioni, rendendo la collaborazione fluida attraverso i continenti. Le piattaforme dei social media hanno trasformato l'interazione umana, creando comunità globali e nuove forme di espressione. Mentre guardiamo al futuro, le tecnologie emergenti come la realtà virtuale, la blockchain e la biotecnologia hanno un immenso potenziale per risolvere problemi complessi e migliorare le capacità umane. La sfida non sta solo nello sviluppare queste tecnologie, ma nel garantire che vadano a beneficio dell'umanità affrontando le preoccupazioni etiche e i problemi di privacy che sorgono.`
  },
  {
    id: 'technical-1',
    title: 'Apprendimento Automatico',
    type: 'technical',
    difficulty: 'hard',
    wordCount: 140,
    content: `Gli algoritmi di apprendimento automatico sono progettati per identificare pattern all'interno di grandi dataset e fare previsioni o decisioni senza programmazione esplicita per ogni scenario. I metodi di apprendimento supervisionato utilizzano dati di addestramento etichettati per costruire modelli predittivi, mentre l'apprendimento non supervisionato scopre strutture nascoste in dati non etichettati. Le reti neurali, ispirate alle strutture biologiche del cervello, consistono di nodi interconnessi che processano informazioni attraverso connessioni ponderate e funzioni di attivazione. Le architetture di deep learning, in particolare le reti neurali convoluzionali, hanno raggiunto successi notevoli nel riconoscimento di immagini e nell'elaborazione del linguaggio naturale. L'ingegneria delle caratteristiche rimane cruciale per le prestazioni del modello, coinvolgendo la selezione e trasformazione delle variabili di input. Le tecniche di regolarizzazione prevengono l'overfitting aggiungendo termini di penalità alle funzioni di perdita. La validazione incrociata assicura la generalizzazione del modello testando le prestazioni su sottoinsiemi di dati non visti.`
  },
  {
    id: 'literary-1',
    title: 'Un Momento di Riflessione',
    type: 'literary',
    difficulty: 'medium',
    wordCount: 160,
    content: `La vecchia quercia stava di sentinella nel giardino, i suoi rami nodosi che si protendevano verso il cielo ambrato come le mani logore del tempo stesso. Sotto la sua chioma espansa, Maya trovava sollievo dal caos della vita moderna. Il dolce fruscio delle foglie sussurrava segreti di stagioni passate, ogni suono una melodia composta dalla sinfonia della natura stessa. Si ricordava delle storie della nonna, raccontate sotto questo stesso albero, racconti di coraggio e amore che avevano plasmato la sua comprensione del mondo. Il profumo del gelsomino galleggiava nella brezza serale, mescolandosi con i ricordi delle estati dell'infanzia trascorse esplorando angoli nascosti del giardino. Mentre il crepuscolo dipingeva l'orizzonte con sfumature di viola e oro, Maya si rese conto che alcuni tesori non potevano mai essere misurati in termini materiali. La saggezza degli alberi, il comfort dei luoghi familiari e il potere duraturo della memoria creavano un arazzo di significato che trascendeva le preoccupazioni temporanee dell'esistenza quotidiana.`
  }
];

type TestState = 'setup' | 'reading' | 'questions' | 'results';

const ReadingSpeedTestModal: React.FC<ReadingSpeedTestModalProps> = ({ isOpen, onClose }) => {
  const { readingSpeed, updateReadingSpeed, getReadingSpeedCategory } = useReadingSpeed();
  
  const [testState, setTestState] = useState<TestState>('setup');
  const [selectedTopic, setSelectedTopic] = useState<TestTopic>(TEST_TOPICS[0]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isReading, setIsReading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Simple comprehension questions based on topic content
  const getQuestionsForTopic = (topic: TestTopic) => {
    switch (topic.id) {
      case 'general-1':
        return [
          { id: 1, question: "Quali sono alcuni esempi di tecnologie emergenti menzionate?", answers: ["VR, blockchain, biotecnologie", "Solo AI e calcolo quantistico", "Solo dispositivi mobili", "Solo social media"], correct: 0 },
          { id: 2, question: "Quale sfida è menzionata riguardo alla tecnologia futura?", answers: ["Riduzione dei costi", "Miglioramento della velocità", "Preoccupazioni etiche e privacy", "Capacità di archiviazione"], correct: 2 }
        ];
      case 'technical-1':
        return [
          { id: 1, question: "Qual è la differenza tra apprendimento supervisionato e non supervisionato?", answers: ["Nessuna differenza", "Il supervisionato usa dati etichettati", "Il non supervisionato è più veloce", "Il supervisionato è più nuovo"], correct: 1 },
          { id: 2, question: "Cosa previene l'overfitting nell'apprendimento automatico?", answers: ["Più dati", "Tecniche di regolarizzazione", "Computer più veloci", "Reti più grandi"], correct: 1 }
        ];
      case 'literary-1':
        return [
          { id: 1, question: "Dove trova sollievo Maya?", answers: ["In città", "Sotto una quercia", "In spiaggia", "Nella sua stanza"], correct: 1 },
          { id: 2, question: "Cosa suggerisce la storia sui veri tesori?", answers: ["Sono costosi", "Sono oggetti materiali", "Includono saggezza e memoria", "Sono metalli rari"], correct: 2 }
        ];
      default:
        return [];
    }
  };

  const questions = getQuestionsForTopic(selectedTopic);

  // Reset test data
  const resetTest = useCallback(() => {
    setTestState('setup');
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    setIsReading(false);
    setWordCount(0);
    setCurrentWpm(0);
    setQuestionsAnswered([]);
    setIsLoading(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Start reading test
  const startTest = useCallback(() => {
    const now = Date.now();
    setTestState('reading');
    setStartTime(now);
    setIsReading(true);
    setElapsedTime(0);
    
    // Start timer
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - now) / 1000);
      setElapsedTime(elapsed);
      
      // Calculate current WPM
      if (elapsed > 0) {
        const currentWords = selectedTopic.wordCount;
        const minutes = elapsed / 60;
        const wpm = Math.round(currentWords / minutes);
        setCurrentWpm(wpm);
      }
    }, 100);
  }, [selectedTopic.wordCount]);

  // Finish reading
  const finishReading = useCallback(() => {
    if (!startTime) return;
    
    setEndTime(Date.now());
    setIsReading(false);
    setTestState('questions');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [startTime]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((questionId: number, answerIndex: number) => {
    setQuestionsAnswered(prev => {
      const updated = [...prev];
      updated[questionId - 1] = answerIndex;
      return updated;
    });
  }, []);

  // Complete test and calculate results
  const completeTest = useCallback(async () => {
    if (!startTime || !endTime) return;
    
    setIsLoading(true);
    
    // Calculate results
    const timeSpentSeconds = (endTime - startTime) / 1000;
    const timeSpentMinutes = timeSpentSeconds / 60;
    const finalWpm = Math.round(selectedTopic.wordCount / timeSpentMinutes);
    
    // Calculate accuracy based on correct answers
    const correctAnswers = questionsAnswered.filter((answer, index) => 
      answer === questions[index]?.correct
    ).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    // Create test result
    const testResult: ReadingTestResult = {
      id: `test-${Date.now()}`,
      wpm: finalWpm,
      accuracy,
      textLength: selectedTopic.wordCount,
      timeSpent: timeSpentSeconds,
      date: new Date(),
      textType: selectedTopic.type
    };
    
    // Update reading speed context
    updateReadingSpeed(testResult);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTestState('results');
    setIsLoading(false);
    
    toast.success("Test di velocità di lettura completato!", {
      description: `La tua velocità di lettura: ${finalWpm} PPM con ${accuracy}% di comprensione`,
      icon: <CheckCircleIcon size={16} />,
    });
  }, [startTime, endTime, selectedTopic, questionsAnswered, questions, updateReadingSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get reading speed category info
  const getSpeedCategoryInfo = (wpm: number) => {
    if (wpm < 150) return { category: 'Lettore Lento', color: 'text-orange-600', icon: <ClockIcon size={16} /> };
    if (wpm < 250) return { category: 'Lettore Medio', color: 'text-blue-600', icon: <BookOpenIcon size={16} /> };
    if (wpm < 350) return { category: 'Lettore Veloce', color: 'text-green-600', icon: <TrendingUpIcon size={16} /> };
    return { category: 'Lettore Rapidissimo', color: 'text-purple-600', icon: <ZapIcon size={16} /> };
  };

  // Handle close and reset
  const handleClose = () => {
    resetTest();
    onClose();
  };

  // Handle cancel during test (reset and close)
  const handleCancel = () => {
    resetTest();
    onClose();
  };

  // Get color class for comprehension score
  const getComprehensionColor = (accuracy: number) => {
    if (accuracy <= 33) return 'text-red-600 border-red-200 bg-gradient-to-br from-red-50 to-red-100';
    if (accuracy <= 66) return 'text-orange-600 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100';
    return 'text-green-600 border-green-200 bg-gradient-to-br from-green-50 to-green-100';
  };

  // Get modal props based on current state
  const getModalProps = () => {
    switch (testState) {
      case 'setup':
        return {
          cancelButton: { text: "Annulla" },
          actionButton: {
            text: "Inizia Test",
            onClick: startTest,
            icon: <PlayIcon size={16} />
          }
        };
      case 'reading':
        return {
          cancelButton: { text: "Annulla" },
          actionButton: {
            text: "Fatto",
            onClick: finishReading,
            icon: <CheckCircleIcon size={16} />
          }
        };
      case 'questions':
        return {
          cancelButton: { text: "Annulla" },
          actionButton: {
            text: "Invia",
            onClick: completeTest,
            disabled: questionsAnswered.length !== questions.length || isLoading,
            loadingText: "Elaborazione Risultati...",
            icon: <CheckCircleIcon size={16} />
          },
          isLoading
        };
      case 'results':
        return {
          cancelButton: {
            text: "Fai un Altro Test",
            onClick: resetTest
          },
          actionButton: {
            text: "Fatto",
            onClick: handleClose,
            icon: <CheckCircleIcon size={16} />
          }
        };
      default:
        return {};
    }
  };

  const modalProps = getModalProps();

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Test di Velocità di Lettura</h2>
          <p className="text-muted-foreground">Testa la tua velocità di lettura e comprensione</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Scegli un argomento del test:</h3>
        <div className="grid grid-cols-3 gap-3">
          {TEST_TOPICS.map((topic) => (
            <Card 
              key={topic.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50",
                selectedTopic.id === topic.id ? "border-primary ring-2 ring-primary/20" : "border-border"
              )}
              onClick={() => setSelectedTopic(topic)}
            >
              <CardContent className="p-3 relative">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{topic.title}</h4>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30 w-fit">
                      {topic.type === 'general' ? 'generale' : topic.type === 'technical' ? 'tecnico' : 'letterario'}
                    </Badge>
                  </div>
                  <div className="absolute">
                    <span className="text-xs text-muted-foreground">{topic.wordCount} parole</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <HelpCircleIcon size={16} />
          Come funziona:
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Leggi l'argomento selezionato al tuo ritmo normale</li>
          <li>Clicca "Fatto" quando hai finito</li>
          <li>Rispondi a 2 domande di comprensione</li>
          <li>Ottieni i risultati di velocità di lettura e precisione</li>
        </ol>
      </div>
    </div>
  );

  const renderReading = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{selectedTopic.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-sm px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30">
              {selectedTopic.type === 'general' ? 'generale' : selectedTopic.type === 'technical' ? 'tecnico' : 'letterario'}
            </Badge>
            <span className="text-sm text-muted-foreground">{selectedTopic.wordCount} parole</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{formatTime(elapsedTime)}</div>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div 
            ref={textRef}
            className="prose prose-sm max-w-none leading-relaxed text-justify font-serif"
            style={{ lineHeight: '1.8', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {selectedTopic.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Verifica di Comprensione</h2>
        <p className="text-muted-foreground">Rispondi a queste domande basate su quello che hai appena letto</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 text-sm">{questionIndex + 1}. {question.question}</h3>
              <div className="space-y-2">
                {question.answers.map((answer, answerIndex) => (
                  <button
                    key={answerIndex}
                    onClick={() => handleAnswerSelect(question.id, answerIndex)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all duration-200 text-sm",
                      questionsAnswered[questionIndex] === answerIndex
                        ? "border-primary bg-primary/10 text-primary hover-primary-effect"
                        : "border-border hover-primary-effect"
                    )}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + answerIndex)}.</span>
                    {answer}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!startTime || !endTime) return null;
    
    const timeSpentSeconds = (endTime - startTime) / 1000;
    const timeSpentMinutes = timeSpentSeconds / 60;
    const finalWpm = Math.round(selectedTopic.wordCount / timeSpentMinutes);
    const correctAnswers = questionsAnswered.filter((answer, index) => 
      answer === questions[index]?.correct
    ).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const speedInfo = getSpeedCategoryInfo(finalWpm);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Test completato</h2>
          <p className="text-muted-foreground">Ecco i tuoi risultati:</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-primary mb-2">{finalWpm}</div>
              <div className="text-sm font-medium">Parole Al Minuto (PPM)</div>
            </CardContent>
          </Card>

          <Card className={getComprehensionColor(accuracy)}>
            <CardContent className="p-4 text-center flex flex-col items-center justify-center">
              <div className={cn("text-3xl font-bold mb-2", 
                accuracy <= 33 ? "text-red-600" : 
                accuracy <= 66 ? "text-orange-600" : 
                "text-green-600"
              )}>{accuracy}%</div>
              <div className="text-sm font-medium">Comprensione del testo</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Test di Velocità di Lettura"
      maxWidth="max-w-3xl"
      className="max-h-[90vh]"
      cancelButton={modalProps.cancelButton}
      actionButton={modalProps.actionButton}
      isLoading={modalProps.isLoading}
    >
      <div className="p-6">
        {testState === 'setup' && renderSetup()}
        {testState === 'reading' && renderReading()}
        {testState === 'questions' && renderQuestions()}
        {testState === 'results' && renderResults()}
      </div>
    </Modal>
  );
};

export default ReadingSpeedTestModal; 