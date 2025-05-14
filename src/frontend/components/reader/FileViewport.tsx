import type React from 'react';
import { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card } from '../ui/card';

interface FileViewportProps {
  currentPage: number;
  zoomLevel: number;
  currentTool: 'text' | 'highlight' | 'draw' | 'note' | 'controls';
}

// Memoize the text content component to prevent re-rendering when other props change
const TextContent = memo(({ content, zoomLevel }: { content: string, zoomLevel: number }) => {
  const fontSize = useMemo(() => `${Math.max(12, 12 * zoomLevel / 100)}px`, [zoomLevel]);

  return (
    <div 
      className="p-8 h-full overflow-auto font-serif"
      style={{ fontSize }}
    >
      {content.split('\n').map((line, index) => (
        <p key={index} className="mb-2 select-text">
          {line}
        </p>
      ))}
    </div>
  );
});

TextContent.displayName = 'TextContent';

// Memoized note annotation component
const NoteAnnotation = memo(({ note }: { note: any }) => {
  const style = useMemo(() => ({ 
    left: `${note.x}px`, 
    top: `${note.y}px`,
    transform: 'translate(-50%, -50%)'
  }), [note.x, note.y]);

  return (
    <div
      className="absolute z-20 w-8 h-8 flex items-center justify-center bg-yellow-200 rounded-full shadow-md cursor-pointer"
      style={style}
    >
      <span className="text-xs font-bold">📝</span>
    </div>
  );
});

NoteAnnotation.displayName = 'NoteAnnotation';

const FileViewport = ({ 
  currentPage, 
  zoomLevel,
  currentTool
}: FileViewportProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState<any[]>([]);
  
  // Use useMemo for mock file content to prevent string recreation on each render
  const mockFileContent = useMemo(() => `
    This is an example of a text file content for page ${currentPage}.
    
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  `.split('\n').map(line => line.trim()).join('\n'), [currentPage]);
  
  // Memoize document dimensions
  const documentStyle = useMemo(() => ({
    width: `${8.5 * zoomLevel / 100}in`,
    height: `${11 * zoomLevel / 100}in`,
    transform: `scale(${zoomLevel / 100})`,
    transformOrigin: 'center',
  }), [zoomLevel]);
  
  // Memoize all event handlers with useCallback
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPos({ x, y });
  }, [currentTool]);
  
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(lastPos.x, lastPos.y);
    context.lineTo(x, y);
    context.stroke();
    
    setLastPos({ x, y });
  }, [isDrawing, currentTool, lastPos]);
  
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);
  
  const handleHighlight = useCallback((_e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool !== 'highlight') return;
    
    // In a real app, this would identify the text being highlighted
    // and store the highlight information
  }, [currentTool]);
  
  const handleAddNote = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool !== 'note') return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add a new note at this position
    const newNote = {
      id: Date.now(),
      x,
      y,
      content: 'New note',
      color: '#ffff00'
    };
    
    setAnnotations(prevAnnotations => [...prevAnnotations, newNote]);
  }, [currentTool]);

  // Setup canvas context using useEffect with proper dependencies
  useEffect(() => {
    if (currentTool === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set up the canvas
        context.strokeStyle = '#000000';
        context.lineWidth = 3; // Medium line width 
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    }
  }, [currentTool]);
  
  // Set cursor based on current tool
  useEffect(() => {
    if (containerRef.current) {
      switch (currentTool) {
        case 'text':
          containerRef.current.style.cursor = 'text';
          break;
        case 'highlight':
          containerRef.current.style.cursor = 'pointer';
          break;
        case 'draw':
          containerRef.current.style.cursor = 'crosshair';
          break;
        case 'note':
          containerRef.current.style.cursor = 'cell';
          break;
        case 'controls':
          // For controls tool, use default cursor
          containerRef.current.style.cursor = 'default';
          break;
        default:
          containerRef.current.style.cursor = 'default';
      }
    }
  }, [currentTool]);
  
  return (
    <Card 
      ref={containerRef}
      className="relative bg-white shadow-md overflow-hidden"
      style={documentStyle}
      onClick={handleAddNote}
    >
      {/* File content - now memoized */}
      <div onMouseUp={handleHighlight}>
        <TextContent content={mockFileContent} zoomLevel={zoomLevel} />
      </div>
      
      {/* Canvas for drawing */}
      {currentTool === 'draw' && (
        <canvas
          ref={canvasRef}
          width={8.5 * 96} // 8.5 inches in pixels at 96 DPI
          height={11 * 96} // 11 inches in pixels at 96 DPI
          className="absolute top-0 left-0 w-full h-full pointer-events-auto z-10"
          style={{ opacity: 0.8 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      )}
      
      {/* Notes - now using memoized components */}
      {annotations.map(note => (
        <NoteAnnotation key={note.id} note={note} />
      ))}
    </Card>
  );
};

FileViewport.displayName = 'FileViewport';

export default memo(FileViewport); 