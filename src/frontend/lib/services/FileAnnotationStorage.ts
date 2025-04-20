import { Drawing, Highlight, Note } from '@/lib/types';

// Define interfaces for our storage
export interface FileAnnotations {
  drawings: Drawing[];
  highlights: Highlight[];
  notes: Note[];
  lastModified: number;
}

interface HistoryItem {
  drawings: Drawing[];
  highlights: Highlight[];
  notes: Note[];
  timestamp: number;
}

export interface FileAnnotationHistory {
  history: HistoryItem[];
  currentIndex: number;
}

/**
 * Service to manage file-specific annotations and their history
 * Uses localStorage for persistence
 */
export class FileAnnotationStorage {
  private static ANNOTATIONS_KEY_PREFIX = 'cloudnotes_annotations_';
  private static HISTORY_KEY_PREFIX = 'cloudnotes_history_';
  
  /**
   * Generate a storage key for a specific file
   */
  private static getAnnotationsKey(filePath: string): string {
    // Create a consistent key by normalizing the path and using it as a suffix
    const normalizedPath = filePath.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${this.ANNOTATIONS_KEY_PREFIX}${normalizedPath}`;
  }
  
  /**
   * Generate a history key for a specific file
   */
  private static getHistoryKey(filePath: string): string {
    const normalizedPath = filePath.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${this.HISTORY_KEY_PREFIX}${normalizedPath}`;
  }
  
  /**
   * Get annotations for a specific file
   */
  static getAnnotations(filePath: string): FileAnnotations {
    try {
      const key = this.getAnnotationsKey(filePath);
      const data = localStorage.getItem(key);
      
      if (data) {
        return JSON.parse(data) as FileAnnotations;
      }
    } catch (error) {
      console.error('Error retrieving annotations:', error);
    }
    
    // Return empty annotations if none exist or there was an error
    return {
      drawings: [],
      highlights: [],
      notes: [],
      lastModified: Date.now()
    };
  }
  
  /**
   * Save annotations for a specific file
   */
  static saveAnnotations(filePath: string, annotations: FileAnnotations): void {
    try {
      const key = this.getAnnotationsKey(filePath);
      
      // Update the last modified timestamp
      const dataToSave = {
        ...annotations,
        lastModified: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  }
  
  /**
   * Get edit history for a specific file
   */
  static getHistory(filePath: string): FileAnnotationHistory {
    try {
      const key = this.getHistoryKey(filePath);
      const data = localStorage.getItem(key);
      
      if (data) {
        return JSON.parse(data) as FileAnnotationHistory;
      }
    } catch (error) {
      console.error('Error retrieving history:', error);
    }
    
    // Return empty history if none exists or there was an error
    return {
      history: [{
        drawings: [],
        highlights: [],
        notes: [],
        timestamp: Date.now()
      }],
      currentIndex: 0
    };
  }
  
  /**
   * Save edit history for a specific file
   */
  static saveHistory(filePath: string, history: FileAnnotationHistory): void {
    try {
      const key = this.getHistoryKey(filePath);
      localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }
  
  /**
   * Clear all annotations and history for a specific file
   */
  static clearFile(filePath: string): void {
    try {
      const annotationsKey = this.getAnnotationsKey(filePath);
      const historyKey = this.getHistoryKey(filePath);
      
      localStorage.removeItem(annotationsKey);
      localStorage.removeItem(historyKey);
    } catch (error) {
      console.error('Error clearing file data:', error);
    }
  }
  
  /**
   * List all files that have annotations
   */
  static listFiles(): string[] {
    try {
      const files: string[] = [];
      const prefix = this.ANNOTATIONS_KEY_PREFIX;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          // Extract file path from the key
          const normalizedPath = key.substring(prefix.length);
          files.push(normalizedPath);
        }
      }
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
} 