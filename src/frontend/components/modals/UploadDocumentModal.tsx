import { useState, useCallback, useRef } from 'react';
import {
  SaveIcon,
  XIcon,
  TagIcon,
  FileTextIcon,
  TypeIcon,
  RefreshCwIcon,
  PlusIcon,
  UploadIcon,
  FileIcon,
  PaletteIcon,
  ImageIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { playSound } from '@/lib/utils/sound';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (documentData: {
    title: string;
    description: string;
    tags: string[];
    file: File;
    thumbnailColor: string;
  }) => void;
  maxWidth?: string;
}

// Predefined colors for thumbnail generation
const thumbnailColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// Allowed file types
const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/epub+zip',
  'text/plain'
];

const UploadDocumentModal = ({
  isOpen,
  onClose,
  onUpload,
  maxWidth = "max-w-4xl"
}: UploadDocumentModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    thumbnailColor: '#3b82f6'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF, Word, PowerPoint, EPUB, or text file",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error("File too large", {
        description: "Please upload a file smaller than 50MB",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-generate title from filename if empty
    if (!formData.title) {
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({ ...prev, title: fileName }));
    }

    // Clear file error
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
  }, [allowedFileTypes, formData.title, errors.file]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle tag addition - supports multiple words
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

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedFile]);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!validateForm() || !selectedFile) return;

    setIsUploading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const documentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags,
        file: selectedFile,
        thumbnailColor: formData.thumbnailColor
      };

      onUpload(documentData);
      
      playSound();
      
      toast.success("Document uploaded successfully", {
        description: "Your document has been uploaded and is now available",
        icon: <SaveIcon size={16} />,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: [],
        thumbnailColor: '#3b82f6'
      });
      setSelectedFile(null);
      setNewTag('');
      setErrors({});
      
      onClose();
    } catch (error) {
      toast.error("Failed to upload document", {
        description: "Please try again",
      });
    } finally {
      setIsUploading(false);
    }
  }, [formData, selectedFile, validateForm, onUpload, onClose]);

  // Handle close with confirmation if there are unsaved changes
  const handleClose = useCallback(() => {
    const hasChanges = 
      formData.title.trim() ||
      formData.description.trim() ||
      formData.tags.length > 0 ||
      selectedFile;

    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          tags: [],
          thumbnailColor: '#3b82f6'
        });
        setSelectedFile(null);
        setNewTag('');
        setErrors({});
        onClose();
      }
    } else {
      onClose();
    }
  }, [formData, selectedFile, onClose]);

  // Render thumbnail preview
  const renderThumbnailPreview = useCallback(() => {
    const colorToUse = hoveredColor || formData.thumbnailColor;
    const titleToShow = formData.title || selectedFile?.name || 'Document Preview';
    
    return (
      <div 
        style={{ backgroundColor: colorToUse }} 
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <span className="text-white font-medium text-center px-2 text-sm relative z-10 drop-shadow-lg">
          {titleToShow.slice(0, 20)}{titleToShow.length > 20 ? '...' : ''}
        </span>
      </div>
    );
  }, [formData.thumbnailColor, formData.title, selectedFile, hoveredColor]);

  // Get file type display
  const getFileTypeDisplay = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toUpperCase();
    return extension || 'FILE';
  }, []);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Upload Document"
      maxWidth={maxWidth}
    >
      <div className="p-8 select-none">
        <div className="flex gap-8">
          {/* Left side - Thumbnail preview and color picker */}
          <div className="flex flex-col items-center">
            {/* Thumbnail Preview */}
            <div className="w-48 h-60 rounded-lg overflow-hidden bg-muted/30 mb-4 shadow-md border border-primary/10">
              {renderThumbnailPreview()}
            </div>
            
            {/* Color Picker */}
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
            {/* File Upload Area - Now at the top and larger */}
            <div 
              className={cn(
                "w-full h-32 rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer",
                isDragOver 
                  ? "border-primary bg-primary/10" 
                  : selectedFile 
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <>
                  <FileIcon size={40} className="text-green-500 mb-2" />
                  <span className="text-base font-medium text-center px-2 text-green-700 dark:text-green-300">
                    {selectedFile.name}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {getFileTypeDisplay(selectedFile)} • {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </>
              ) : (
                <>
                  <UploadIcon size={40} className={isDragOver ? "text-primary" : "text-muted-foreground"} />
                  <span className={cn(
                    "text-base font-medium text-center px-2 mt-2",
                    isDragOver ? "text-primary" : "text-muted-foreground"
                  )}>
                    {isDragOver ? "Drop file here" : "Drag & drop or click to browse"}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    PDF, Word, PowerPoint, EPUB, TXT up to 50MB
                  </span>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.epub,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {errors.file && (
              <p className="text-red-500 text-xs">{errors.file}</p>
            )}

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
                  placeholder="Add tags..."
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
          </div>
        </div>

        {/* Action buttons moved to bottom */}
        <Separator className="my-8" />
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
            className="gap-2 rounded-full hover-primary-effect cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="gap-2 rounded-full cursor-pointer"
          >
            {isUploading ? (
              <>
                <span className="animate-spin">
                  <RefreshCwIcon size={16} />
                </span>
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon size={16} />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadDocumentModal; 