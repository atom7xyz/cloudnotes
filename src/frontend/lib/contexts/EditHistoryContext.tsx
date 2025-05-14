import type React from 'react';
import { createContext, useContext, type ReactNode, useState } from 'react'
import useEditHistory from '../hooks/useEditHistory';
import type { Drawing, Highlight, Note } from '@/lib/types';

// Define the context shape
type EditHistoryContextType = {
  drawings: Drawing[];
  highlights: Highlight[];
  notes: Note[];
  updateDrawings: (drawings: Drawing[]) => void;
  updateHighlights: (highlights: Highlight[]) => void;
  updateNotes: (notes: Note[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  setCurrentFilePath: (filePath: string) => void;
  currentFilePath: string;
};

// Create the context with a default value
const EditHistoryContext = createContext<EditHistoryContextType | undefined>(undefined);

// Provider component
export const EditHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Track the current file path
  const [currentFilePath, setCurrentFilePath] = useState<string>('/assets/files/genesis.pdf');
  
  // Initialize history manager with the default file path
  const historyManager = useEditHistory(currentFilePath);
  
  return (
    <EditHistoryContext.Provider value={{
      drawings: historyManager.drawings,
      highlights: historyManager.highlights,
      notes: historyManager.notes,
      updateDrawings: historyManager.updateDrawings,
      updateHighlights: historyManager.updateHighlights,
      updateNotes: historyManager.updateNotes,
      undo: historyManager.undo,
      redo: historyManager.redo,
      canUndo: historyManager.canUndo,
      canRedo: historyManager.canRedo,
      setCurrentFilePath,
      currentFilePath
    }}>
      {children}
    </EditHistoryContext.Provider>
  );
};

// Custom hook to use the context
export const useEditHistoryContext = (): EditHistoryContextType => {
  const context = useContext(EditHistoryContext);
  if (context === undefined) {
    throw new Error('useEditHistoryContext must be used within an EditHistoryProvider');
  }
  return context;
};

export default EditHistoryContext; 