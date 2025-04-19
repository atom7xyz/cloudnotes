import { useState, useCallback } from 'react';

/**
 * Generic type for edit history items
 */
export type HistoryItem<T> = {
  drawings?: T[];
  highlights?: T[];
  timestamp: number;
};

/**
 * Custom hook for managing edit history with undo and redo functionality
 */
export function useEditHistory<T>(initialDrawings: T[] = [], initialHighlights: T[] = []) {
  // Current state
  const [drawings, setDrawings] = useState<T[]>(initialDrawings);
  const [highlights, setHighlights] = useState<T[]>(initialHighlights);
  
  // History state
  const [history, setHistory] = useState<HistoryItem<T>[]>([
    { drawings: initialDrawings, highlights: initialHighlights, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track if undo/redo is available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add new state to history
  const pushHistory = useCallback((newDrawings?: T[], newHighlights?: T[]) => {
    const newHistoryItem: HistoryItem<T> = {
      drawings: newDrawings || drawings,
      highlights: newHighlights || highlights,
      timestamp: Date.now()
    };
    
    // When we're not at the end of history (user did undo),
    // remove everything after current position
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add the new state and update index
    setHistory([...newHistory, newHistoryItem]);
    setCurrentIndex(newHistory.length);
  }, [drawings, highlights, history, currentIndex]);
  
  // Update drawings and add to history
  const updateDrawings = useCallback((newDrawings: T[]) => {
    setDrawings(newDrawings);
    pushHistory(newDrawings, undefined);
  }, [pushHistory]);
  
  // Update highlights and add to history
  const updateHighlights = useCallback((newHighlights: T[]) => {
    setHighlights(newHighlights);
    pushHistory(undefined, newHighlights);
  }, [pushHistory]);
  
  // Undo the last action
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const newIndex = currentIndex - 1;
    const previousState = history[newIndex];
    
    if (previousState.drawings) {
      setDrawings(previousState.drawings);
    }
    
    if (previousState.highlights) {
      setHighlights(previousState.highlights);
    }
    
    setCurrentIndex(newIndex);
  }, [canUndo, currentIndex, history]);
  
  // Redo the last undone action
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    const newIndex = currentIndex + 1;
    const nextState = history[newIndex];
    
    if (nextState.drawings) {
      setDrawings(nextState.drawings);
    }
    
    if (nextState.highlights) {
      setHighlights(nextState.highlights);
    }
    
    setCurrentIndex(newIndex);
  }, [canRedo, currentIndex, history]);
  
  return {
    drawings,
    highlights,
    updateDrawings,
    updateHighlights,
    undo,
    redo,
    canUndo,
    canRedo
  };
}

export default useEditHistory; 