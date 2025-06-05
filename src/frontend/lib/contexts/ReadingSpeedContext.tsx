import type React from 'react';
import { createContext, useContext, type ReactNode, useState, useCallback, useEffect } from 'react';

export interface ReadingSpeedData {
  wpm: number; // words per minute
  completedTests: number;
  lastTestDate: Date | null;
  averageWpm: number;
  testHistory: ReadingTestResult[];
  isFirstTestCompleted: boolean;
  hasInteractedWithTimerAfterFirstTest: boolean;
}

export interface ReadingTestResult {
  id: string;
  wpm: number;
  accuracy: number;
  textLength: number;
  timeSpent: number; // in seconds
  date: Date;
  textType: 'technical' | 'literary' | 'general';
}

export interface EstimatedReadingTime {
  totalMinutes: number;
  hours: number;
  minutes: number;
  pagesCount?: number;
  wordsPerPage?: number;
}

interface ReadingSpeedContextType {
  readingSpeed: ReadingSpeedData;
  updateReadingSpeed: (newResult: ReadingTestResult) => void;
  estimateReadingTime: (wordCount: number, documentType?: 'technical' | 'literary' | 'general') => EstimatedReadingTime;
  getOptimalTimerDuration: (wordCount: number, documentType?: 'technical' | 'literary' | 'general') => number;
  hasValidReadingSpeed: boolean;
  getReadingSpeedCategory: () => 'slow' | 'average' | 'fast' | 'very-fast';
  clearReadingSpeedData: () => void;
  markTimerInteractionAfterFirstTest: () => void;
}

const ReadingSpeedContext = createContext<ReadingSpeedContextType | undefined>(undefined);

const DEFAULT_READING_SPEED: ReadingSpeedData = {
  wpm: 200, // Average adult reading speed
  completedTests: 0,
  lastTestDate: null,
  averageWpm: 200,
  testHistory: [],
  isFirstTestCompleted: false,
  hasInteractedWithTimerAfterFirstTest: false
};

const STORAGE_KEY = 'cloudnotes-reading-speed';

export const ReadingSpeedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [readingSpeed, setReadingSpeed] = useState<ReadingSpeedData>(DEFAULT_READING_SPEED);

  // Load reading speed data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const restoredData: ReadingSpeedData = {
          ...parsed,
          lastTestDate: parsed.lastTestDate ? new Date(parsed.lastTestDate) : null,
          testHistory: parsed.testHistory.map((test: any) => ({
            ...test,
            date: new Date(test.date)
          }))
        };
        setReadingSpeed(restoredData);
      }
    } catch (error) {
      console.error('Failed to load reading speed data:', error);
    }
  }, []);

  // Save reading speed data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readingSpeed));
    } catch (error) {
      console.error('Failed to save reading speed data:', error);
    }
  }, [readingSpeed]);

  const updateReadingSpeed = useCallback((newResult: ReadingTestResult) => {
    setReadingSpeed(prev => {
      const newHistory = [...prev.testHistory, newResult].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10); // Keep last 10 tests
      const totalWpm = newHistory.reduce((sum, test) => sum + test.wpm, 0);
      const averageWpm = newHistory.length > 0 ? Math.round(totalWpm / newHistory.length) : newResult.wpm;
      const isFirstTest = prev.completedTests === 0;

      return {
        wpm: newResult.wpm,
        completedTests: prev.completedTests + 1,
        lastTestDate: newResult.date,
        averageWpm,
        testHistory: newHistory,
        isFirstTestCompleted: isFirstTest ? true : prev.isFirstTestCompleted,
        hasInteractedWithTimerAfterFirstTest: prev.hasInteractedWithTimerAfterFirstTest
      };
    });
  }, []);

  const estimateReadingTime = useCallback((wordCount: number, documentType: 'technical' | 'literary' | 'general' = 'general'): EstimatedReadingTime => {
    let effectiveWpm = readingSpeed.averageWpm;

    // Adjust reading speed based on document type
    switch (documentType) {
      case 'technical':
        effectiveWpm *= 0.7; // Technical documents are slower to read
        break;
      case 'literary':
        effectiveWpm *= 0.9; // Literary texts might be slightly slower
        break;
      case 'general':
      default:
        // Keep base reading speed
        break;
    }

    const totalMinutes = Math.ceil(wordCount / effectiveWpm);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      totalMinutes,
      hours,
      minutes,
      pagesCount: Math.ceil(wordCount / 250), // Approximate 250 words per page
      wordsPerPage: 250
    };
  }, [readingSpeed.averageWpm]);

  const getOptimalTimerDuration = useCallback((wordCount: number, documentType: 'technical' | 'literary' | 'general' = 'general'): number => {
    const estimate = estimateReadingTime(wordCount, documentType);
    // Add 20% buffer time for optimal reading experience
    const bufferTime = Math.ceil(estimate.totalMinutes * 1.2);
    
    // Round to nearest 5 minutes and ensure minimum of 5 minutes
    return Math.max(5, Math.ceil(bufferTime / 5) * 5);
  }, [estimateReadingTime]);

  const hasValidReadingSpeed = readingSpeed.completedTests > 0;

  const getReadingSpeedCategory = useCallback((): 'slow' | 'average' | 'fast' | 'very-fast' => {
    const wpm = readingSpeed.averageWpm;
    if (wpm < 150) return 'slow';
    if (wpm < 250) return 'average';
    if (wpm < 350) return 'fast';
    return 'very-fast';
  }, [readingSpeed.averageWpm]);

  const clearReadingSpeedData = useCallback(() => {
    setReadingSpeed(DEFAULT_READING_SPEED);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const markTimerInteractionAfterFirstTest = useCallback(() => {
    setReadingSpeed(prev => ({
      ...prev,
      hasInteractedWithTimerAfterFirstTest: true
    }));
  }, []);

  return (
    <ReadingSpeedContext.Provider value={{
      readingSpeed,
      updateReadingSpeed,
      estimateReadingTime,
      getOptimalTimerDuration,
      hasValidReadingSpeed,
      getReadingSpeedCategory,
      clearReadingSpeedData,
      markTimerInteractionAfterFirstTest
    }}>
      {children}
    </ReadingSpeedContext.Provider>
  );
};

export const useReadingSpeed = (): ReadingSpeedContextType => {
  const context = useContext(ReadingSpeedContext);
  if (!context) {
    throw new Error('useReadingSpeed must be used within a ReadingSpeedProvider');
  }
  return context;
}; 