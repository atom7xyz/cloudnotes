declare module 'epubjs' {
  export interface SpineItem {
    href: string;
    id: string;
    index: number;
  }

  export interface Spine {
    items: SpineItem[];
    get(index: number): SpineItem;
    length: number;
  }

  export interface Book {
    spine: Spine;
    ready: Promise<any>;
    destroy(): void;
    renderTo(element: HTMLElement, options: any): any;
  }

  export default function ePub(url: string, options?: any): Book;
} 