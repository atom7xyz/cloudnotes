import { useState, useCallback, useEffect } from 'react';
import {
  SaveIcon,
  XIcon,
  TagIcon,
  FileTextIcon,
  PaletteIcon,
  TypeIcon,
  RefreshCwIcon,
  PlusIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import type { MockDocument } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { playSound } from '@/lib/utils/sound';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MockDocument | null;
  onSave: (updatedDocument: Partial<MockDocument>) => void;
  maxWidth?: string;
}

// Predefined colors for thumbnail generation
const thumbnailColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const EditDocumentModal = ({
  isOpen,
  onClose,
  document,
  onSave,
  maxWidth = "max-w-4xl"
}: EditDocumentModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    thumbnailColor: '#3b82f6'
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Initialize form data when document changes
  useEffect(() => {
    if (document) {
      // Extract color from thumbnail data
      const [color] = document.file.thumbnail.split(':');
      setFormData({
        title: document.title,
        description: document.description,
        tags: [...document.file.tags],
        thumbnailColor: color || '#3b82f6'
      });
      setErrors({});
    }
  }, [document]);

  // Generate thumbnail preview
  const generateThumbnail = useCallback((color: string, title: string) => {
    const text = encodeURIComponent(title.slice(0, 20) + (title.length > 20 ? '...' : ''));
    return `${color}:${text}`;
  }, []);

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle tag addition - now supports multiple words
  const handleAddTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    if (trimmedTag) {
      // Split by spaces and filter out empty strings
      const newTags = trimmedTag.split(/\s+/).filter(tag => tag.length > 0);
      const uniqueNewTags = newTags.filter(tag => !formData.tags.includes(tag));
      
      if (uniqueNewTags.length > 0) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, ...uniqueNewTags] }));
        setNewTag('');
      }
    }
  }, [newTag, formData.tags]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  }, []);

  // Handle key press for tag input
  const handleTagKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  // Validate form - removed description and tags as required
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!document || !validateForm()) return;

    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedDocument: Partial<MockDocument> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        file: {
          ...document.file,
          tags: formData.tags,
          thumbnail: generateThumbnail(formData.thumbnailColor, formData.title.trim())
        }
      };

      onSave(updatedDocument);
      
      playSound();

      toast.success("Document updated successfully", {
        description: "Your changes have been saved",
        icon: <SaveIcon size={16} />,
      });
      
      onClose();
    } catch (error) {
      toast.error("Failed to update document", {
        description: "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  }, [document, formData, validateForm, generateThumbnail, onSave, onClose]);

  // Handle close with confirmation if there are unsaved changes
  const handleClose = useCallback(() => {
    if (!document) {
      onClose();
      return;
    }

    const hasChanges = 
      formData.title !== document.title ||
      formData.description !== document.description ||
      JSON.stringify(formData.tags.sort()) !== JSON.stringify(document.file.tags.sort()) ||
      formData.thumbnailColor !== document.file.thumbnail.split(':')[0];

    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [formData, document, onClose]);

  // Render thumbnail preview
  const renderThumbnailPreview = useCallback(() => {
    const colorToUse = hoveredColor || formData.thumbnailColor;
    return (
      <div 
        style={{ backgroundColor: colorToUse }} 
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <span className="text-white font-medium text-center px-2 text-sm relative z-10 drop-shadow-lg">
          {formData.title.slice(0, 20)}{formData.title.length > 20 ? '...' : ''}
        </span>
      </div>
    );
  }, [formData.thumbnailColor, formData.title, hoveredColor]);

  if (!document) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Edit Document"
      maxWidth={maxWidth}
    >
      <div className="p-8 select-none">
        <div className="flex gap-8">
          {/* Left side - Thumbnail preview and color picker */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-60 rounded-lg overflow-hidden bg-muted/30 mb-4 shadow-md border border-primary/10">
              {renderThumbnailPreview()}
            </div>
            
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <PaletteIcon size={16} className="text-primary" />
                <span className="font-medium text-sm">Select color:</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {thumbnailColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-colors",
                      formData.thumbnailColor === color 
                        ? "border-foreground shadow-md" 
                        : "border-muted-foreground/30"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleFieldChange('thumbnailColor', color)}
                    onMouseEnter={() => setHoveredColor(color)}
                    onMouseLeave={() => setHoveredColor(null)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side - Form fields */}
          <div className="flex-1 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon size={16} className="text-primary" />
                <label className="font-medium text-sm">Title:</label>
                <span className="text-red-500">*</span>
              </div>
              <Input
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter document title..."
                className={cn(
                  "text-base",
                  errors.title && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileTextIcon size={16} className="text-primary" />
                <label className="font-medium text-sm">Description:</label>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Enter document description..."
                className="min-h-[120px] resize-none text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TagIcon size={16} className="text-primary" />
                <label className="font-medium text-sm">Tags:</label>
              </div>
              
              {/* Current tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-sm px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30 group cursor-pointer hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <XIcon size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                ))}
              </div>
              
              {/* Add new tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add tags (separate with spaces)..."
                  className="text-sm"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="gap-2 hover-primary-effect"
                >
                  <PlusIcon size={16} />
                  Add Tag
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isSaving}
                className="gap-2 rounded-full hover-primary-effect cursor-pointer"
              >
                <XIcon size={16} />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 rounded-full cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">
                      <RefreshCwIcon size={16} />
                    </span>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon size={16} />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditDocumentModal; 