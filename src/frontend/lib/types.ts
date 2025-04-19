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
 * Scroll modes for PDF viewing
 */
export enum ScrollMode {
  PAGE = 'page',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
} 