import React, { createContext, useContext, ReactNode } from 'react';
import useEditHistory from '../hooks/useEditHistory';
import { Drawing, Highlight } from '@/lib/types';

// Define the context shape
type EditHistoryContextType = {
  drawings: Drawing[];
  highlights: Highlight[];
  updateDrawings: (drawings: Drawing[]) => void;
  updateHighlights: (highlights: Highlight[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

// Create the context with a default value
const EditHistoryContext = createContext<EditHistoryContextType | undefined>(undefined);

// Provider component
export const EditHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const historyManager = useEditHistory<Drawing | Highlight>([], []);
  
  return (
    <EditHistoryContext.Provider value={{
      drawings: historyManager.drawings as Drawing[],
      highlights: historyManager.highlights as Highlight[],
      updateDrawings: historyManager.updateDrawings as (d: Drawing[]) => void,
      updateHighlights: historyManager.updateHighlights as (h: Highlight[]) => void,
      undo: historyManager.undo,
      redo: historyManager.redo,
      canUndo: historyManager.canUndo,
      canRedo: historyManager.canRedo,
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