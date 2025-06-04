/**
 * Point coordinates for drawing path
 */
export interface DrawingPoint {
  x: number;
  y: number;
}

/**
 * Drawing annotation on a PDF page
 */
export interface Drawing {
  id: string;
  pageNumber: number;
  path: DrawingPoint[];
  color: string;
  lineWidth: number;
}

/**
 * Text highlight annotation on a PDF page
 */
export interface Highlight {
  id: string;
  pageNumber: number;
  position: { 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
  };
  color: string;
  content: string;
}

/**
 * Note annotation for a PDF page
 */
export interface Note {
  id: string;
  pageNumber: number;
  content: string;
  title?: string;
  isGlobal?: boolean;
  position?: {
    x: number;
    y: number;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Bookmark annotation for a PDF page
 */
export interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  lineNumber?: number;
  position?: {
    x: number;
    y: number;
  };
  createdAt: number;
  updatedAt: number;
  selectedText?: string;
  previewText?: string;
}

/**
 * Scroll modes for PDF viewing
 */
export enum ScrollMode {
  PAGE = 'page',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
} 