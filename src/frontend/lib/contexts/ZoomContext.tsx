import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ZoomContextType {
  zoomLevel: number;
  isDraggingZoom: boolean;
  setZoomLevel: (value: number) => void;
  setZoomLevelFromSlider: (values: number[]) => void;
  setIsDraggingZoom: (isDragging: boolean) => void;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export const ZoomProvider: React.FC<{ children: ReactNode, initialZoom?: number }> = ({ 
  children, 
  initialZoom = 100 
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  const [isDraggingZoom, setIsDraggingZoom] = useState<boolean>(false);

  const setZoomLevelFromSlider = useCallback((values: number[]) => {
    setZoomLevel(values[0]);
  }, []);

  const value = {
    zoomLevel,
    isDraggingZoom,
    setZoomLevel,
    setZoomLevelFromSlider,
    setIsDraggingZoom,
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
}; 