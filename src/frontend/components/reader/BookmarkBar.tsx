import type React from 'react';
import { useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bookmark, 
  ChevronFirst,
  ChevronRight,
  Plus,
  MapPin,
  PinIcon} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useEditHistoryContext } from '@/lib/contexts/EditHistoryContext';
import type { Bookmark as BookmarkType } from '@/lib/types';

interface BookmarkBarProps {
  currentPage: number;
  newBookmarkRef?: React.RefObject<HTMLInputElement>;
  onNavigateToPage?: (pageNumber: number) => void;
  onHighlightText?: (text: string, pageNumber: number) => void;
}

// Helper function to get selected text from the document
const getSelectedText = (): { text: string; previewText: string } => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { text: '', previewText: '' };
  }
  
  const selectedText = selection.toString().trim();
  if (!selectedText) {
    return { text: '', previewText: '' };
  }
  
  // Create preview text (first line or up to 50 characters)
  const firstLine = selectedText.split('\n')[0];
  const previewText = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  
  return { text: selectedText, previewText };
};

// Helper function to get a human-readable location string
const getBookmarkLocationText = (bookmark: BookmarkType): string => {
  let location = `Pagina ${bookmark.pageNumber}`;
  if (bookmark.lineNumber) {
    location += `, Riga ${bookmark.lineNumber}`;
  }
  return location;
};

// Sortable bookmark component with dnd-kit - now memoized
const SortableBookmark = memo(({ 
  bookmark, 
  updateBookmarkTitle, 
  deleteBookmark,
  bookmarks,
  newBookmarkRef,
  onNavigateToBookmark
}: {
  bookmark: BookmarkType;
  updateBookmarkTitle: (id: string, title: string) => void;
  deleteBookmark: (id: string) => void;
  bookmarks: BookmarkType[];
  newBookmarkRef?: React.RefObject<HTMLInputElement>; 
  onNavigateToBookmark?: (bookmark: BookmarkType) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: bookmark.id });
  
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);
  
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateBookmarkTitle(bookmark.id, e.target.value);
  }, [bookmark.id, updateBookmarkTitle]);
  
  const handleDelete = useCallback(() => {
    deleteBookmark(bookmark.id);
  }, [bookmark.id, deleteBookmark]);
  
  const handleNavigate = useCallback(() => {
    if (onNavigateToBookmark) {
      onNavigateToBookmark(bookmark);
    }
  }, [bookmark, onNavigateToBookmark]);
  
  const locationText = useMemo(() => getBookmarkLocationText(bookmark), [bookmark]);
  
  // Add handlers to prevent drag listeners from taking focus away
  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  
  const handleInputFocus = useCallback((e: React.FocusEvent) => {
    e.stopPropagation();
  }, []);
  
  // Get latest bookmark id for auto-focusing
  const getLatestBookmarkId = useMemo(() => {
    if (!bookmarks || bookmarks.length === 0) return '';
    return bookmarks.reduce((latest, bookmark) => {
      const currentCreatedAt = bookmark.createdAt || 0;
      const latestCreatedAt = latest.createdAt || 0;
      return currentCreatedAt > latestCreatedAt ? bookmark : latest;
    }, bookmarks[0]).id;
  }, [bookmarks]);
  
  return (
    <Card ref={setNodeRef} style={style} className={`p-0 overflow-hidden relative cursor-pointer ${bookmark.selectedText ? 'border-blue-200 dark:border-blue-800' : ''}`} {...attributes}>
      {/* Colored drag handle on the left side - enhanced for bookmarks with text */}
      <div 
        className={`absolute top-0 left-0 bottom-0 w-2 cursor-grab ${bookmark.selectedText ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-blue-500'}`}
        {...listeners}
      />
      
      {/* Bookmark content container */}
      <div className="p-3 pl-4" onClick={handleNavigate}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <PinIcon className={`h-5 w-5 mr-2 ${bookmark.selectedText ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500'}`} />
              <input 
                type="text"
                className="text-sm border-none p-0 focus:ring-0 focus:outline-none hover:text-primary w-full bg-transparent font-medium"
                value={bookmark.title || ''}
                onChange={handleTitleChange}
                onClick={handleInputClick}
                onFocus={handleInputFocus}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                ref={bookmark.id === getLatestBookmarkId ? newBookmarkRef || null : null}
              />
            </div>
            
            {/* Show preview text if available - below title, full width */}
            {bookmark.previewText && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300 border-l-2 border-blue-200 dark:border-blue-800 select-none">
                {bookmark.previewText}
              </div>
            )}
            
            <span className="text-[10px] text-muted-foreground ml-1 mt-1 select-none">
              {locationText}
            </span>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover-primary-effect"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
              title="Vai al segnalibro"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover-primary-effect" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <span className="sr-only">Elimina segnalibro</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              >
                <title>Delete icon</title>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});

SortableBookmark.displayName = 'SortableBookmark';

const BookmarkBar = memo(({
  currentPage,
  newBookmarkRef,
  onNavigateToPage,
  onHighlightText
}: BookmarkBarProps) => {
  // All state declarations at the top level
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use EditHistoryContext for file-specific bookmarks
  const { bookmarks, updateBookmarks, currentFilePath } = useEditHistoryContext();
  
  // Create sensors for DnD - properly declared at the top level
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Sort bookmarks by page number and creation time - memoize to prevent recreation on every render
  const sortedBookmarks = useMemo(() => 
    [...bookmarks].sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
      return a.createdAt - b.createdAt;
    }),
    [bookmarks]
  );
  
  // Memoize the sorted bookmark ids for the SortableContext
  const sortedBookmarkIds = useMemo(() => 
    sortedBookmarks.map(bookmark => bookmark.id),
    [sortedBookmarks]
  );
  
  // Use useCallback for all event handlers to maintain stable references
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  
  const addBookmark = useCallback(() => {
    // Get selected text from the document
    const { text: selectedText, previewText } = getSelectedText();
    
    // Create simple numbered title
    const defaultTitle = `Segnalibro ${bookmarks.length + 1}`;
    
    const newBookmark: BookmarkType = {
      id: `bookmark-${Date.now()}`,
      pageNumber: currentPage,
      title: defaultTitle,
      lineNumber: Math.floor(Math.random() * 50) + 1, // Random line number for demo
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: { x: 0, y: 0 },
      selectedText: selectedText || undefined,
      previewText: previewText || undefined
    };
    
    const updatedBookmarks = [newBookmark, ...bookmarks];
    updateBookmarks(updatedBookmarks);
    
    // Focus on the newly created bookmark if ref is provided
    if (newBookmarkRef?.current) {
      setTimeout(() => {
        if (newBookmarkRef.current) {
          newBookmarkRef.current.focus();
          newBookmarkRef.current.select();
        }
      }, 100);
    }
  }, [currentPage, bookmarks, updateBookmarks, newBookmarkRef]);
  
  const updateBookmarkTitle = useCallback((id: string, title: string) => {
    const updatedBookmarks = bookmarks.map(bookmark => 
      bookmark.id === id ? { ...bookmark, title, updatedAt: Date.now() } : bookmark
    );
    updateBookmarks(updatedBookmarks);
  }, [bookmarks, updateBookmarks]);
  
  const deleteBookmark = useCallback((id: string) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    updateBookmarks(updatedBookmarks);
  }, [bookmarks, updateBookmarks]);
  
  const onNavigateToBookmark = useCallback((bookmark: BookmarkType) => {
    // Navigate to the bookmark's page
    if (onNavigateToPage) {
      onNavigateToPage(bookmark.pageNumber);
    }
    
    // If the bookmark has selected text, highlight it
    if (bookmark.selectedText && onHighlightText) {
      // Delay highlighting to ensure page navigation is complete
      setTimeout(() => {
        if (onHighlightText) {
          onHighlightText(bookmark.selectedText!, bookmark.pageNumber);
        }
      }, 500);
    }
    
    console.log('Navigate to bookmark:', bookmark);
  }, [onNavigateToPage, onHighlightText]);
  
  // Handle drag end event for reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over) {
      const updatedBookmarks = [...bookmarks];
      const activeIndex = updatedBookmarks.findIndex(item => item.id === active.id);
      const overIndex = updatedBookmarks.findIndex(item => item.id === over.id);
      
      // Create a new array with the reordered items
      const [movedItem] = updatedBookmarks.splice(activeIndex, 1);
      updatedBookmarks.splice(overIndex, 0, movedItem);
      
      updateBookmarks(updatedBookmarks);
    }
  }, [bookmarks, updateBookmarks]);
  
  // Render empty state when there are no bookmarks
  const emptyBookmarksContent = useMemo(() => (
    <p className="text-sm text-muted-foreground text-center py-4 select-none">
      Nessun segnalibro in questo documento
    </p>
  ), []);
  
  // Render bookmarks list when there are bookmarks
  const bookmarksListContent = useMemo(() => (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext 
        items={sortedBookmarkIds} 
        strategy={verticalListSortingStrategy}
      >
        {sortedBookmarks.map(bookmark => (
          <SortableBookmark
            key={bookmark.id}
            bookmark={bookmark}
            updateBookmarkTitle={updateBookmarkTitle}
            deleteBookmark={deleteBookmark}
            bookmarks={bookmarks}
            newBookmarkRef={newBookmarkRef}
            onNavigateToBookmark={onNavigateToBookmark}
          />
        ))}
      </SortableContext>
    </DndContext>
  ), [sortedBookmarks, sortedBookmarkIds, sensors, handleDragEnd, updateBookmarkTitle, deleteBookmark, bookmarks, newBookmarkRef, onNavigateToBookmark]);
  
  return (
    <div className="relative h-full flex">
      <div 
        className={`${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'} border-l border-border bg-transparent backdrop-blur-sm transition-all duration-300 h-full flex flex-col overflow-hidden relative`}
      >
        <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md bg-background hover-primary-effect"
            onClick={toggleSidebar}
            title="Nascondi barra laterale"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="select-none">Segnalibri</Label>
              <Button 
                variant="outline"
                size="sm"
                onClick={addBookmark}
                className="select-none hover-primary-effect"
              >
                <Plus className="h-4 w-4" />
                Aggiungi
              </Button>
            </div>
            
            {/* Helpful tip */}
            <div className="text-xs text-center select-none border border-yellow-300 rounded-md p-2 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
              <span className="font-medium">SUGGERIMENTO:</span> Seleziona il testo prima di aggiungere un segnalibro per catturare il contenuto
            </div>
            
            <div className="space-y-2">
              {sortedBookmarks.length === 0 ? emptyBookmarksContent : bookmarksListContent}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {isCollapsed && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md bg-background hover-primary-effect"
            onClick={toggleSidebar}
            title="Mostra barra laterale"
          >
            <ChevronFirst className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
});

BookmarkBar.displayName = 'BookmarkBar';

// Export the component with memo
export default BookmarkBar; 