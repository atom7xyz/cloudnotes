import { useState, useCallback, useEffect } from 'react';
import { FileAnnotationStorage } from '@/lib/services/FileAnnotationStorage';
import { Drawing, Highlight, Note } from '@/lib/types';

/**
 * Generic type for edit history items
 */
export type HistoryItem<T> = {
  drawings?: T[];
  highlights?: T[];
  timestamp: number;
};

/**
 * Custom hook for managing edit history with undo and redo functionality.
 * Provides file-specific history storage.
 */
export function useEditHistory(filePath: string) {
  // Get initial data from storage
  const getInitialData = useCallback(() => {
    const annotations = FileAnnotationStorage.getAnnotations(filePath);
    const historyData = FileAnnotationStorage.getHistory(filePath);
    return {
      drawings: annotations.drawings,
      highlights: annotations.highlights,
      notes: annotations.notes,
      history: historyData.history,
      currentIndex: historyData.currentIndex
    };
  }, [filePath]);

  // Current state
  const [drawings, setDrawings] = useState<Drawing[]>(() => getInitialData().drawings);
  const [highlights, setHighlights] = useState<Highlight[]>(() => getInitialData().highlights);
  const [notes, setNotes] = useState<Note[]>(() => getInitialData().notes);
  
  // History state
  const [history, setHistory] = useState<Array<{
    drawings: Drawing[];
    highlights: Highlight[];
    notes: Note[];
    timestamp: number;
  }>>(() => getInitialData().history);
  
  const [currentIndex, setCurrentIndex] = useState<number>(() => getInitialData().currentIndex);
  
  // Track if undo/redo is available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Auto-save the current state to localStorage
  useEffect(() => {
    
    // Create a timer to save to localStorage
    const saveTimer = setTimeout(() => {
      // Save annotations
      FileAnnotationStorage.saveAnnotations(filePath, {
        drawings,
        highlights,
        notes,
        lastModified: Date.now()
      });
      
      // Save history
      FileAnnotationStorage.saveHistory(filePath, {
        history,
        currentIndex
      });
      
    }, 500); // Short delay to prevent excessive writes
    
    return () => {
      clearTimeout(saveTimer);
    };
  }, [filePath, drawings, highlights, notes, history, currentIndex]);
  
  // Add new state to history
  const pushHistory = useCallback((newDrawings?: Drawing[], newHighlights?: Highlight[], newNotes?: Note[]) => {
    const newHistoryItem = {
      drawings: newDrawings || drawings,
      highlights: newHighlights || highlights,
      notes: newNotes || notes,
      timestamp: Date.now()
    };
    
    // When we're not at the end of history (user did undo),
    // remove everything after current position
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add the new state and update index
    setHistory([...newHistory, newHistoryItem]);
    setCurrentIndex(newHistory.length);
  }, [drawings, highlights, notes, history, currentIndex]);
  
  // Update drawings and add to history
  const updateDrawings = useCallback((newDrawings: Drawing[]) => {
    setDrawings(newDrawings);
    pushHistory(newDrawings, undefined, undefined);
  }, [pushHistory]);
  
  // Update highlights and add to history
  const updateHighlights = useCallback((newHighlights: Highlight[]) => {
    setHighlights(newHighlights);
    pushHistory(undefined, newHighlights, undefined);
  }, [pushHistory]);
  
  // Update notes and add to history
  const updateNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    pushHistory(undefined, undefined, newNotes);
  }, [pushHistory]);
  
  // Undo the last action
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const newIndex = currentIndex - 1;
    const previousState = history[newIndex];
    
    setDrawings(previousState.drawings);
    setHighlights(previousState.highlights);
    setNotes(previousState.notes);
    setCurrentIndex(newIndex);
  }, [canUndo, currentIndex, history]);
  
  // Redo the last undone action
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    const newIndex = currentIndex + 1;
    const nextState = history[newIndex];
    
    setDrawings(nextState.drawings);
    setHighlights(nextState.highlights);
    setNotes(nextState.notes);
    setCurrentIndex(newIndex);
  }, [canRedo, currentIndex, history]);
  
  // When filePath changes, reload data from storage
  useEffect(() => {
    
    // Load new data for this file
    const data = getInitialData();
    
    // Update all state values
    setDrawings(data.drawings);
    setHighlights(data.highlights);
    setNotes(data.notes);
    setHistory(data.history);
    setCurrentIndex(data.currentIndex);
  }, [filePath, getInitialData]);
  
  return {
    drawings,
    highlights,
    notes,
    updateDrawings,
    updateHighlights,
    updateNotes,
    undo,
    redo,
    canUndo,
    canRedo
  };
}

export default useEditHistory; 