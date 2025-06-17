import { useState, useCallback, useEffect } from 'react';
import {
  SaveIcon,
  XIcon,
  UserIcon,
  FileTextIcon,
  ImageIcon,
  TypeIcon,
  RefreshCwIcon,
  CameraIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { playSound } from '@/lib/utils/sound';
import UnsavedChangesModal from './UnsavedChangesModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
    bio: string;
  } | null;
  onSave: (updatedUser: Partial<{
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
    bio: string;
  }>) => void;
  maxWidth?: string;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  maxWidth = "max-w-4xl"
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    avatar: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar
      });
      setErrors({});
    }
  }, [user, isOpen]);

  // Close unsaved changes modal when main modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowUnsavedChangesModal(false);
    }
  }, [isOpen]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle avatar change
  const handleAvatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload the file to a server
      // For now, we'll just use a placeholder URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!user || !validateForm()) return;

    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedUser = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar
      };

      onSave(updatedUser);
      
      playSound();
      
      toast.success("Profile updated successfully", {
        description: "Your changes have been saved",
        icon: <SaveIcon size={16} />,
      });
      
      onClose();
    } catch (error) {
      toast.error("Failed to update profile", {
        description: "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, formData, validateForm, onSave, onClose]);

  // Handle close with confirmation if there are unsaved changes
  const handleClose = useCallback(() => {
    if (!user) {
      onClose();
      return;
    }

    const hasChanges = 
      formData.firstName !== user.firstName ||
      formData.lastName !== user.lastName ||
      formData.username !== user.username ||
      formData.bio !== user.bio ||
      formData.avatar !== user.avatar;

    if (hasChanges) {
      setShowUnsavedChangesModal(true);
    } else {
      onClose();
    }
  }, [formData, user, onClose]);

  // Handle unsaved changes confirmation
  const handleUnsavedChangesConfirm = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Edit Profile"
      maxWidth={maxWidth}
    >
      <div className="p-8 select-none">
        <div className="flex gap-8">
          {/* Left side - Avatar and upload */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-md">
                <img src={formData.avatar} alt="Profile" />
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors border-4 border-white dark:border-gray-800">
                    <CameraIcon size={24} className="text-white" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          {/* Right side - Form fields */}
          <div className="flex-1 space-y-6">
            {/* First Name and Last Name on same row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon size={16} className="text-primary" />
                  <label className="font-medium text-sm">First Name:</label>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  placeholder="Enter your first name..."
                  className={cn(
                    "text-base",
                    errors.firstName && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon size={16} className="text-primary" />
                  <label className="font-medium text-sm">Last Name:</label>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  placeholder="Enter your last name..."
                  className={cn(
                    "text-base",
                    errors.lastName && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon size={16} className="text-primary" />
                <label className="font-medium text-sm">Username:</label>
                <span className="text-red-500">*</span>
              </div>
              <Input
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="Enter your username..."
                className={cn(
                  "text-base",
                  errors.username && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileTextIcon size={16} className="text-primary" />
                <label className="font-medium text-sm">Bio:</label>
              </div>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[120px] resize-none text-sm"
              />
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

      <UnsavedChangesModal
        isOpen={showUnsavedChangesModal}
        onClose={() => setShowUnsavedChangesModal(false)}
        onConfirm={handleUnsavedChangesConfirm}
        title="Discard Profile Changes?"
        actionType="close"
      />
    </Modal>
  );
};

export default EditProfileModal; 