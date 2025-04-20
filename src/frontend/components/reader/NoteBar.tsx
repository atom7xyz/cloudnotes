import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  StickyNote, 
  ChevronFirst,
  ChevronRight,
  Plus,
  PenSquare,
  Globe} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
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
import { Note } from '@/lib/types';

interface NoteBarProps {
  currentPage: number;
  newNoteRef?: React.RefObject<HTMLTextAreaElement>;
}

// Helper function to get a human-readable location string
const getNoteLocationText = (note: Note): string => {
  if (note.isGlobal) {
    return "Global note (visible on all pages)";
  }
  return `Page ${note.pageNumber}`;
};

// Sortable note component with dnd-kit - now memoized
const SortableNote = memo(({ 
  note, 
  updateNoteTitle, 
  updateNote, 
  toggleNoteGlobal, 
  deleteNote,
  notes,
  newNoteRef
}: {
  note: Note;
  updateNoteTitle: (id: string, title: string) => void;
  updateNote: (id: string, text: string) => void;
  toggleNoteGlobal: (id: string) => void;
  deleteNote: (id: string) => void;
  notes: Note[];
  newNoteRef?: React.RefObject<HTMLTextAreaElement>; 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: note.id });
  
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);
  
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNoteTitle(note.id, e.target.value);
  }, [note.id, updateNoteTitle]);
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNote(note.id, e.target.value);
  }, [note.id, updateNote]);
  
  const handleToggleGlobal = useCallback(() => {
    toggleNoteGlobal(note.id);
  }, [note.id, toggleNoteGlobal]);
  
  const handleDelete = useCallback(() => {
    deleteNote(note.id);
  }, [note.id, deleteNote]);
  
  const locationText = useMemo(() => getNoteLocationText(note), [note]);
  
  // Add handlers to prevent drag listeners from taking focus away
  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  
  const handleInputFocus = useCallback((e: React.FocusEvent) => {
    e.stopPropagation();
  }, []);
  
  // Get note color based on whether it's global or not
  const getNoteColor = useMemo(() => {
    return note.isGlobal ? "bg-yellow-500" : "bg-gray-500";
  }, [note.isGlobal]);
  
  // Get latest note id for auto-focusing
  const getLatestNoteId = useMemo(() => {
    if (!notes || notes.length === 0) return '';
    return notes.reduce((latest, note) => {
      const currentCreatedAt = note.createdAt || 0;
      const latestCreatedAt = latest.createdAt || 0;
      return currentCreatedAt > latestCreatedAt ? note : latest;
    }, notes[0]).id;
  }, [notes]);
  
  return (
    <Card ref={setNodeRef} style={style} className="p-0 overflow-hidden relative" {...attributes}>
      {/* Colored drag handle on the left side */}
      <div 
        className={`absolute top-0 left-0 bottom-0 w-2 ${getNoteColor} cursor-grab`}
        {...listeners}
      />
      
      {/* Note content container */}
      <div className="p-3 pl-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center">
              <StickyNote className="h-5 w-5 mr-2 text-yellow-500" />
              <input 
                type="text"
                className="text-xs border-none p-0 focus:ring-0 focus:outline-none hover:text-primary w-full bg-transparent font-medium"
                value={note.title || ''}
                onChange={handleTitleChange}
                onClick={handleInputClick}
                onFocus={handleInputFocus}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            </div>
            <span className="text-[10px] text-muted-foreground ml-7 mt-0.5 select-none">
              {locationText}
            </span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-6 w-6 ${note.isGlobal ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={handleToggleGlobal}
              title={note.isGlobal ? "Global note (click to make page-specific)" : "Page-specific note (click to make global)"}
            >
              {note.isGlobal ? <PenSquare className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleDelete}
            >
              <span className="sr-only">Delete</span>
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
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </Button>
          </div>
        </div>
        <textarea
          className="mt-2 w-full text-sm p-2 border rounded-md"
          value={note.content || ''}
          rows={3}
          onChange={handleTextChange}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          ref={note.id === getLatestNoteId ? newNoteRef || null : null}
        />
      </div>
    </Card>
  );
});

SortableNote.displayName = 'SortableNote';

const NoteBar = memo(({
  currentPage,
  newNoteRef
}: NoteBarProps) => {
  // All state declarations at the top level
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use EditHistoryContext for file-specific notes
  const { notes, updateNotes, currentFilePath } = useEditHistoryContext();
  
  // Create sensors for DnD - properly declared at the top level
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Filter notes for current page - memoize to prevent recreation on every render
  const visibleNotes = useMemo(() => 
    notes.filter(note => note.pageNumber === currentPage || note.isGlobal) || [],
    [notes, currentPage]
  );
  
  // Memoize the sorted note ids for the SortableContext
  const sortedNoteIds = useMemo(() => 
    visibleNotes.map(note => note.id),
    [visibleNotes]
  );
  
  // Use useCallback for all event handlers to maintain stable references
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  
  const addNote = useCallback(() => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      pageNumber: currentPage,
      content: `New note on page ${currentPage}`,
      title: `Note ${notes.length + 1}`,
      isGlobal: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: { x: 0, y: 0 }
    };
    
    const updatedNotes = [newNote, ...notes];
    updateNotes(updatedNotes);
    
    // Focus on the newly created note if ref is provided
    if (newNoteRef?.current) {
      setTimeout(() => {
        if (newNoteRef.current) {
          newNoteRef.current.focus();
        }
      }, 100);
    }
  }, [currentPage, notes, updateNotes, newNoteRef]);
  
  const updateNote = useCallback((id: string, content: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, content, updatedAt: Date.now() } : note
    );
    updateNotes(updatedNotes);
  }, [notes, updateNotes]);
  
  const updateNoteTitle = useCallback((id: string, title: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, title, updatedAt: Date.now() } : note
    );
    updateNotes(updatedNotes);
  }, [notes, updateNotes]);
  
  const toggleNoteGlobal = useCallback((id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isGlobal: !note.isGlobal, updatedAt: Date.now() } : note
    );
    updateNotes(updatedNotes);
  }, [notes, updateNotes]);
  
  const deleteNote = useCallback((id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    updateNotes(updatedNotes);
  }, [notes, updateNotes]);
  
  // Handle drag end event for reordering
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const updatedNotes = [...notes];
      const activeIndex = updatedNotes.findIndex(item => item.id === active.id);
      const overIndex = updatedNotes.findIndex(item => item.id === over.id);
      
      // Create a new array with the reordered items
      const [movedItem] = updatedNotes.splice(activeIndex, 1);
      updatedNotes.splice(overIndex, 0, movedItem);
      
      updateNotes(updatedNotes);
    }
  }, [notes, updateNotes]);
  
  // Render empty state when there are no notes
  const emptyNotesContent = useMemo(() => (
    <p className="text-sm text-muted-foreground text-center py-4 select-none">
      No notes on this page
    </p>
  ), []);
  
  // Render notes list when there are notes
  const notesListContent = useMemo(() => (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext 
        items={sortedNoteIds} 
        strategy={verticalListSortingStrategy}
      >
        {visibleNotes.map(note => (
          <SortableNote
            key={note.id}
            note={note}
            updateNoteTitle={updateNoteTitle}
            updateNote={updateNote}
            toggleNoteGlobal={toggleNoteGlobal}
            deleteNote={deleteNote}
            notes={notes}
            newNoteRef={newNoteRef}
          />
        ))}
      </SortableContext>
    </DndContext>
  ), [visibleNotes, sortedNoteIds, sensors, handleDragEnd, updateNoteTitle, updateNote, toggleNoteGlobal, deleteNote, notes, newNoteRef]);
  
  return (
    <div className="relative h-full flex">
      <div 
        className={`${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'} border-l border-border bg-transparent backdrop-blur-sm transition-all duration-300 h-full flex flex-col overflow-hidden relative`}
      >
        <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md bg-background"
            onClick={toggleSidebar}
            title="Hide sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="select-none">Notes</Label>
              <Button 
                variant="outline"
                size="sm"
                onClick={addNote}
                className="select-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
            
            <div className="space-y-2">
              {visibleNotes.length === 0 ? emptyNotesContent : notesListContent}
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {isCollapsed && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md bg-background"
            onClick={toggleSidebar}
            title="Show sidebar"
          >
            <ChevronFirst className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
});

NoteBar.displayName = 'NoteBar';

// Export the component with memo
export default NoteBar; 