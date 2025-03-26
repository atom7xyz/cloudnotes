import React, { useState } from 'react';
import { Button } from '../ui/button';
import LoadingModal from '../modals/LoadingModal';
import { Card } from '../ui/card';

const LoadingModalDemo = () => {
  const [isDefaultLoading, setIsDefaultLoading] = useState(false);
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);

  const simulateLoading = (type: 'default' | 'custom' | 'fullscreen') => {
    switch (type) {
      case 'default':
        setIsDefaultLoading(true);
        setTimeout(() => setIsDefaultLoading(false), 3000);
        break;
      case 'custom':
        setIsCustomLoading(true);
        setTimeout(() => setIsCustomLoading(false), 3000);
        break;
      case 'fullscreen':
        setIsFullScreenLoading(true);
        setTimeout(() => setIsFullScreenLoading(false), 3000);
        break;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Loading Modal Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border">
          <h2 className="text-lg font-semibold mb-4">Default Loading</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Displays a simple loading overlay with the default message.
          </p>
          <Button 
            onClick={() => simulateLoading('default')}
            className="rounded-full cursor-pointer"
          >
            Show Default Loading
          </Button>
        </Card>

        <Card className="p-6 border-border">
          <h2 className="text-lg font-semibold mb-4">Custom Message</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Loading modal with a custom message for the specific operation.
          </p>
          <Button 
            onClick={() => simulateLoading('custom')}
            className="rounded-full cursor-pointer"
          >
            Show Custom Message
          </Button>
        </Card>

        <Card className="p-6 border-border md:col-span-2 bg-primary/5">
          <h2 className="text-lg font-semibold mb-4">Fullscreen Loading</h2>
          <p className="text-sm text-muted-foreground mb-6">
            True fullscreen experience that takes over the entire screen. Features a larger spinner, 
            prominent message, and wider progress bar. Use for initial app loads or major operations.
          </p>
          <Button 
            onClick={() => simulateLoading('fullscreen')}
            className="rounded-full cursor-pointer"
            variant="default"
          >
            Show Fullscreen Loading
          </Button>
        </Card>
      </div>

      {/* Loading Modals */}
      <LoadingModal isOpen={isDefaultLoading} />
      
      <LoadingModal 
        isOpen={isCustomLoading} 
        message="Uploading files to the cloud..."
      />
      
      <LoadingModal 
        isOpen={isFullScreenLoading} 
        message="Preparing your workspace..." 
        fullScreen={true}
      />
    </div>
  );
};

export default LoadingModalDemo; 