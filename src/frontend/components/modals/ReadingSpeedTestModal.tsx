import type React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
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
import { toast } from 'sonner';
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
    title: 'The Future of Technology',
    type: 'general',
    difficulty: 'medium',
    wordCount: 150,
    content: `The rapid advancement of technology continues to reshape our daily lives in unprecedented ways. From artificial intelligence powering smart homes to quantum computing promising breakthrough solutions, we stand at the threshold of a new era. Mobile devices have evolved from simple communication tools to powerful computers that fit in our pockets. Cloud computing has revolutionized how we store and access information, making collaboration seamless across continents. Social media platforms have transformed human interaction, creating global communities and new forms of expression. As we look toward the future, emerging technologies like virtual reality, blockchain, and biotechnology hold immense potential to solve complex problems and enhance human capabilities. The challenge lies not just in developing these technologies, but in ensuring they benefit humanity while addressing ethical concerns and privacy issues that arise.`
  },
  {
    id: 'technical-1',
    title: 'Machine Learning',
    type: 'technical',
    difficulty: 'hard',
    wordCount: 140,
    content: `Machine learning algorithms are designed to identify patterns within large datasets and make predictions or decisions without explicit programming for each scenario. Supervised learning methods utilize labeled training data to build predictive models, while unsupervised learning discovers hidden structures in unlabeled data. Neural networks, inspired by biological brain structures, consist of interconnected nodes that process information through weighted connections and activation functions. Deep learning architectures, particularly convolutional neural networks, have achieved remarkable success in image recognition and natural language processing tasks. Feature engineering remains crucial for model performance, involving the selection and transformation of input variables. Regularization techniques prevent overfitting by adding penalty terms to loss functions. Cross-validation ensures model generalization by testing performance on unseen data subsets.`
  },
  {
    id: 'literary-1',
    title: 'A Moment of Reflection',
    type: 'literary',
    difficulty: 'medium',
    wordCount: 160,
    content: `The old oak tree stood sentinel in the garden, its gnarled branches reaching toward the amber sky like the weathered hands of time itself. Beneath its sprawling canopy, Maya found solace from the chaos of modern life. The gentle rustle of leaves whispered secrets of seasons past, each sound a melody composed by nature's own symphony. She remembered her grandmother's stories, told beneath this very tree, tales of courage and love that had shaped her understanding of the world. The scent of jasmine drifted on the evening breeze, mingling with memories of childhood summers spent exploring hidden corners of the garden. As twilight painted the horizon in shades of purple and gold, Maya realized that some treasures could never be measured in material terms. The wisdom of trees, the comfort of familiar places, and the enduring power of memory created a tapestry of meaning that transcended the temporary concerns of daily existence.`
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
          { id: 1, question: "What are some examples of emerging technologies mentioned?", answers: ["VR, blockchain, biotechnology", "Only AI and quantum computing", "Just mobile devices", "Social media only"], correct: 0 },
          { id: 2, question: "What challenge is mentioned regarding future technology?", answers: ["Cost reduction", "Speed improvement", "Ethical concerns and privacy", "Storage capacity"], correct: 2 }
        ];
      case 'technical-1':
        return [
          { id: 1, question: "What is the difference between supervised and unsupervised learning?", answers: ["No difference", "Supervised uses labeled data", "Unsupervised is faster", "Supervised is newer"], correct: 1 },
          { id: 2, question: "What prevents overfitting in machine learning?", answers: ["More data", "Regularization techniques", "Faster computers", "Larger networks"], correct: 1 }
        ];
      case 'literary-1':
        return [
          { id: 1, question: "Where does Maya find solace?", answers: ["In the city", "Under an oak tree", "At the beach", "In her room"], correct: 1 },
          { id: 2, question: "What does the story suggest about true treasures?", answers: ["They are expensive", "They are material objects", "They include wisdom and memory", "They are rare metals"], correct: 2 }
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
    
    toast.success("Reading speed test completed!", {
      description: `Your reading speed: ${finalWpm} WPM with ${accuracy}% comprehension`,
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
    if (wpm < 150) return { category: 'Slow Reader', color: 'text-orange-600', icon: <ClockIcon size={16} /> };
    if (wpm < 250) return { category: 'Average Reader', color: 'text-blue-600', icon: <BookOpenIcon size={16} /> };
    if (wpm < 350) return { category: 'Fast Reader', color: 'text-green-600', icon: <TrendingUpIcon size={16} /> };
    return { category: 'Speed Reader', color: 'text-purple-600', icon: <ZapIcon size={16} /> };
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

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Reading Speed Test</h2>
          <p className="text-muted-foreground">Test your reading speed and comprehension</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Choose a test topic:</h3>
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
                      {topic.type}
                    </Badge>
                  </div>
                  <div className="absolute">
                    <span className="text-xs text-muted-foreground">{topic.wordCount} words</span>
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
          How it works:
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Read the selected topic at your normal pace</li>
          <li>Click "Done" when finished</li>
          <li>Answer 2 comprehension questions</li>
          <li>Get your reading speed and accuracy results</li>
        </ol>
      </div>

      <div className="flex justify-end border-t pt-4 gap-2">
        <Button onClick={handleCancel} variant="outline" className="rounded-full cursor-pointer hover-primary-effect">
          Cancel
        </Button>
        <Button onClick={startTest} className="rounded-full cursor-pointer hover:bg-primary/90">
          <PlayIcon size={16} />
          Start Test
        </Button>
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
              {selectedTopic.type}
            </Badge>
            <span className="text-sm text-muted-foreground">{selectedTopic.wordCount} words</span>
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

      <div className="flex justify-end border-t pt-4 gap-2">
        <Button onClick={handleCancel} variant="outline" className="rounded-full cursor-pointer hover-primary-effect">
          Cancel
        </Button>
        <Button onClick={finishReading} className="gap-2 rounded-full cursor-pointer hover:bg-primary/90">
          <CheckCircleIcon size={16} />
          Done
        </Button>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Comprehension Check</h2>
        <p className="text-muted-foreground">Answer these questions based on what you just read</p>
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

      <div className="flex justify-end border-t pt-4 gap-2">
        <Button onClick={handleCancel} variant="outline" className="rounded-full cursor-pointer hover-primary-effect">
          Cancel
        </Button>
        <Button 
          onClick={completeTest} 
          disabled={questionsAnswered.length !== questions.length || isLoading}
          className="gap-2 rounded-full cursor-pointer hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <RefreshCwIcon size={16} className="animate-spin" />
              Processing Results...
            </>
          ) : (
            <>
              <CheckCircleIcon size={16} />
              Submit
            </>
          )}
        </Button>
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
          <h2 className="text-2xl font-bold">Test completed</h2>
          <p className="text-muted-foreground">Here are your results:</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-primary mb-2">{finalWpm}</div>
              <div className="text-sm font-medium">Words Per Minute (WPM)</div>
            </CardContent>
          </Card>

          <Card className={getComprehensionColor(accuracy)}>
            <CardContent className="p-4 text-center flex flex-col items-center justify-center">
              <div className={cn("text-3xl font-bold mb-2", 
                accuracy <= 33 ? "text-red-600" : 
                accuracy <= 66 ? "text-orange-600" : 
                "text-green-600"
              )}>{accuracy}%</div>
              <div className="text-sm font-medium">Text comprehension</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={resetTest} variant="outline" className="rounded-full cursor-pointer hover-primary-effect">
            <RotateCcwIcon size={16} />
            Take Another Test
          </Button>
          <Button onClick={handleClose} className="rounded-full cursor-pointer hover:bg-primary/90">
            <CheckCircleIcon size={16} />
            Done
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reading Speed Test"
      maxWidth="max-w-3xl"
      className="max-h-[90vh]"
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