import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import UnsavedChangesModal from '../modals/UnsavedChangesModal';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const UnsavedChangesDemo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Simulate saving data
    console.log('Saving data:', formData);
    setIsDirty(false);
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setIsDirty(false);
  };

  const handleNavigateClick = (path: string) => {
    if (isDirty) {
      setTargetPath(path);
      setIsModalOpen(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Unsaved Changes Demo</h1>
      
      <div className="mb-6 p-4 bg-background border border-border rounded-md">
        <p className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">Form Status:</span> {isDirty ? (
            <span className="text-red-500 font-medium">Unsaved Changes</span>
          ) : (
            <span className="text-green-500 font-medium">All Changes Saved</span>
          )}
        </p>
      </div>

      <form className="space-y-4 mb-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">Message</label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="flex space-x-3">
          <Button type="button" onClick={handleSave}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={handleResetForm}>Reset Form</Button>
        </div>
      </form>

      <div className="border-t border-border pt-6">
        <h2 className="text-lg font-medium mb-4">Test Navigation</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click these buttons to navigate to different pages. If you have unsaved changes, a confirmation modal will appear.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => handleNavigateClick('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button type="button" onClick={() => handleNavigateClick('/notes')}>
            Go to Notes
          </Button>
          <Button type="button" onClick={() => handleNavigateClick('/profile')}>
            Go to Profile
          </Button>
          <Button type="button" onClick={() => handleNavigateClick('/tos')}>
            Go to Terms of Service
          </Button>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetPath={targetPath}
        message="You have unsaved changes in the form. Are you sure you want to leave this page? Your changes will be lost."
      />
    </div>
  );
};

export default UnsavedChangesDemo; 