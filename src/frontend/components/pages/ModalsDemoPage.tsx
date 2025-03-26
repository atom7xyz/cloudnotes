import { useState } from "react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import UnsavedChangesModal from "../modals/UnsavedChangesModal";
import SessionExpiredModal from "../modals/SessionExpiredModal";
import LoadingModal from "../modals/LoadingModal";
import { 
  PlusIcon, 
  PrinterIcon, 
  SettingsIcon, 
  InfoIcon,
  ExpandIcon,
  MaximizeIcon,
  MinimizeIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  LoaderIcon,
  PaletteIcon
} from "lucide-react";

export default function ModalsDemoPage() {
  // Basic Modal Demos state
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isCustomHeaderModalOpen, setIsCustomHeaderModalOpen] = useState(false);
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isCustomSizeModalOpen, setIsCustomSizeModalOpen] = useState(false);
  const [isScrollingContentModalOpen, setIsScrollingContentModalOpen] = useState(false);
  
  // Session Expired Modal state
  const [isSessionExpiredOpen, setIsSessionExpiredOpen] = useState(false);
  
  // Unsaved Changes Modal state
  const [isUnsavedChangesOpen, setIsUnsavedChangesOpen] = useState(false);
  
  // Loading Modal states
  const [isDefaultLoading, setIsDefaultLoading] = useState(false);
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  
  // Shadcn color palette
  const colorClasses = [
    { name: 'background', class: 'bg-background' },
    { name: 'foreground', class: 'text-foreground' },
    { name: 'card', class: 'bg-card' },
    { name: 'card foreground', class: 'text-card-foreground' },
    { name: 'popover', class: 'bg-popover' },
    { name: 'popover foreground', class: 'text-popover-foreground' },
    { name: 'primary', class: 'bg-primary' },
    { name: 'primary foreground', class: 'text-primary-foreground' },
    { name: 'secondary', class: 'bg-secondary' },
    { name: 'secondary foreground', class: 'text-secondary-foreground' },
    { name: 'muted', class: 'bg-muted' },
    { name: 'muted foreground', class: 'text-muted-foreground' },
    { name: 'accent', class: 'bg-accent' },
    { name: 'accent foreground', class: 'text-accent-foreground' },
    { name: 'destructive', class: 'bg-destructive' },
    { name: 'destructive foreground', class: 'text-destructive-foreground' },
    { name: 'border', class: 'border border-border' },
    { name: 'input', class: 'bg-input' },
    { name: 'ring', class: 'ring ring-ring' }
  ];
  
  // Helper function for loading modals
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
    <div className="container py-8 max-w-7xl px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Modal Components Showcase</h1>
        <p className="text-lg text-muted-foreground">
          This page demonstrates all available modal components and their configurations in CloudNotes.
        </p>
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="basic" className="gap-2">
            <InfoIcon size={16} />
            <span>Basic Modals</span>
          </TabsTrigger>
          <TabsTrigger value="functional" className="gap-2">
            <AlertOctagonIcon size={16} />
            <span>Functional Modals</span>
          </TabsTrigger>
          <TabsTrigger value="loading" className="gap-2">
            <LoaderIcon size={16} />
            <span>Loading States</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <PaletteIcon size={16} />
            <span>Color System</span>
          </TabsTrigger>
        </TabsList>
        
        {/* BASIC MODALS TAB */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Modal */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <InfoIcon size={20} />
                <span>Basic Modal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A simple modal with a title and content.
              </p>
              <Button 
                onClick={() => setIsBasicModalOpen(true)}
                className="w-full rounded-full"
              >
                Open Basic Modal
              </Button>
              
              <Modal
                isOpen={isBasicModalOpen}
                onClose={() => setIsBasicModalOpen(false)}
                title="Basic Modal"
              >
                <div className="p-6 space-y-4">
                  <p>
                    This is a basic modal with a title in the header and this content in the body.
                  </p>
                  <p>
                    The modal can be closed by:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Clicking the X button in the header</li>
                    <li>Pressing the Escape key</li>
                    <li>Calling the onClose function</li>
                  </ul>
                </div>
              </Modal>
            </Card>
            
            {/* Custom Header Modal */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <SettingsIcon size={20} />
                <span>Custom Header</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A modal with custom header actions.
              </p>
              <Button 
                onClick={() => setIsCustomHeaderModalOpen(true)}
                className="w-full rounded-full"
              >
                Open Custom Header Modal
              </Button>
              
              <Modal
                isOpen={isCustomHeaderModalOpen}
                onClose={() => setIsCustomHeaderModalOpen(false)}
                title="Document Settings"
                headerActions={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full"
                  >
                    <PlusIcon size={18} />
                  </Button>
                }
              >
                <div className="p-6 space-y-4">
                  <p>
                    This modal has custom actions in the header alongside the close button.
                  </p>
                  <p>
                    You can add any number of components to the headerActions prop.
                  </p>
                </div>
              </Modal>
            </Card>
            
            {/* Footer Modal */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <PrinterIcon size={20} />
                <span>With Footer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A modal with a sticky footer.
              </p>
              <Button 
                onClick={() => setIsFooterModalOpen(true)}
                className="w-full rounded-full"
              >
                Open Footer Modal
              </Button>
              
              <Modal
                isOpen={isFooterModalOpen}
                onClose={() => setIsFooterModalOpen(false)}
                title="Modal with Footer"
                footer={
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsFooterModalOpen(false)}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => setIsFooterModalOpen(false)}
                      className="rounded-full"
                    >
                      Save Changes
                    </Button>
                  </div>
                }
              >
                <div className="p-6">
                  <p className="mb-4">
                    This modal has a sticky footer that stays at the bottom even when scrolling.
                  </p>
                  <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i}>
                        <h3 className="font-medium">Section {i + 1}</h3>
                        <p className="text-muted-foreground">
                          This is a sample content section to demonstrate scrolling behavior.
                        </p>
                        {i < 9 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </Modal>
            </Card>
            
            {/* Custom Size Modal */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MaximizeIcon size={20} />
                <span>Custom Size</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A modal with custom width and height.
              </p>
              <Button 
                onClick={() => setIsCustomSizeModalOpen(true)}
                className="w-full rounded-full"
              >
                Open Custom Size Modal
              </Button>
              
              <Modal
                isOpen={isCustomSizeModalOpen}
                onClose={() => setIsCustomSizeModalOpen(false)}
                title="Custom Size Modal"
                maxWidth="max-w-xl"
                maxHeight="max-h-[400px]"
              >
                <div className="p-6 space-y-4">
                  <p>
                    This modal has a custom width of <code>max-w-xl</code> and a custom height of <code>max-h-[400px]</code>.
                  </p>
                  <p>
                    You can use any Tailwind width/height class or custom CSS size for the <code>maxWidth</code> and <code>maxHeight</code> props.
                  </p>
                  <div className="border border-border p-4 rounded-md bg-muted/30">
                    <p className="font-mono text-sm mb-2">Example usage:</p>
                    <pre className="text-xs bg-black text-white p-2 rounded overflow-x-auto">
                      {`<Modal
  maxWidth="max-w-xl"
  maxHeight="max-h-[400px]"
  ...other props
/>`}
                    </pre>
                  </div>
                </div>
              </Modal>
            </Card>
            
            {/* Scrolling Content Modal */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <ExpandIcon size={20} />
                <span>Scrolling Content</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A modal with scrollable content and fixed size.
              </p>
              <Button 
                onClick={() => setIsScrollingContentModalOpen(true)}
                className="w-full rounded-full"
              >
                Open Scrolling Modal
              </Button>
              
              <Modal
                isOpen={isScrollingContentModalOpen}
                onClose={() => setIsScrollingContentModalOpen(false)}
                title="Scrolling Content"
                maxWidth="max-w-md"
                maxHeight="max-h-[300px]"
              >
                <div className="p-6">
                  <p className="mb-4 font-medium">
                    This modal has a fixed height of 300px but contains more content, creating a scrollbar.
                  </p>
                  <div className="space-y-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="border-b border-border pb-2">
                        <p><strong>Item {i + 1}</strong>: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Vivamus lacinia odio vitae vestibulum vestibulum.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Modal>
            </Card>
            
            {/* Fullscreen Modal */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MinimizeIcon size={20} />
                <span>Fullscreen</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A modal that takes up the entire screen.
              </p>
              <Button 
                onClick={() => setIsFullscreenModalOpen(true)}
                className="w-full rounded-full"
              >
                Open Fullscreen Modal
              </Button>
              
              <Modal
                isOpen={isFullscreenModalOpen}
                onClose={() => setIsFullscreenModalOpen(false)}
                title="Fullscreen Modal"
                fullScreen={true}
              >
                <div className="p-6 h-full flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-bold mb-2">Immersive Experience</h2>
                  <p className="text-lg mb-8 text-center max-w-md">
                    This modal takes up the entire screen, providing an immersive experience for complex tasks.
                  </p>
                  <Button 
                    onClick={() => setIsFullscreenModalOpen(false)}
                    className="rounded-full"
                  >
                    Close Fullscreen Modal
                  </Button>
                </div>
              </Modal>
            </Card>
          </div>
        </TabsContent>
        
        {/* FUNCTIONAL MODALS TAB */}
        <TabsContent value="functional" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Expired Modal Demo */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Important</Badge>
                <h2 className="text-lg font-medium">Session Expired</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Modal that appears when a user's session has timed out due to inactivity.
              </p>
              <div className="bg-muted/30 p-4 rounded-md text-sm text-muted-foreground">
                <p>Use Cases:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Session timeout due to inactivity</li>
                  <li>Authentication required for sensitive operations</li>
                  <li>Token expiration in the background</li>
                </ul>
              </div>
              <Button 
                onClick={() => setIsSessionExpiredOpen(true)}
                className="w-full rounded-full"
                variant="destructive"
              >
                Show Session Expired Modal
              </Button>
              
              <SessionExpiredModal
                isOpen={isSessionExpiredOpen}
                onClose={() => setIsSessionExpiredOpen(false)}
              />
            </Card>
            
            {/* Unsaved Changes Modal Demo */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Confirmation</Badge>
                <h2 className="text-lg font-medium">Unsaved Changes</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Modal that appears when a user attempts to navigate away with unsaved changes.
              </p>
              <div className="bg-muted/30 p-4 rounded-md text-sm text-muted-foreground">
                <p>Use Cases:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Form navigation with pending changes</li>
                  <li>Document editing with unsaved work</li>
                  <li>Protecting users from accidental data loss</li>
                </ul>
              </div>
              <Button 
                onClick={() => setIsUnsavedChangesOpen(true)}
                className="w-full rounded-full"
                variant="destructive"
              >
                Show Unsaved Changes Modal
              </Button>
              
              <UnsavedChangesModal
                isOpen={isUnsavedChangesOpen}
                onClose={() => setIsUnsavedChangesOpen(false)}
                targetPath="#"
                message="You have unsaved changes in your document. Are you sure you want to leave this page? Your changes will be lost."
              />
            </Card>
          </div>
        </TabsContent>
        
        {/* LOADING STATES TAB */}
        <TabsContent value="loading" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-border">
              <h2 className="text-lg font-semibold mb-4">Default Loading</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Displays a simple loading overlay with the default message.
              </p>
              <Button 
                onClick={() => simulateLoading('default')}
                className="rounded-full cursor-pointer w-full"
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
                className="rounded-full cursor-pointer w-full"
              >
                Show Custom Message
              </Button>
            </Card>

            <Card className="p-6 border-border md:col-span-2 bg-blue-50/30 dark:bg-blue-950/10">
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
          
          <div className="mt-6">
            <Card className="p-6 bg-muted/10">
              <h3 className="text-lg font-medium mb-4">Loading Modal API</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Props</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="font-mono mb-1">isOpen: boolean</p>
                      <p className="text-muted-foreground">Controls visibility of the loading modal</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="font-mono mb-1">message?: string</p>
                      <p className="text-muted-foreground">Custom loading message to display</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="font-mono mb-1">fullScreen?: boolean</p>
                      <p className="text-muted-foreground">Whether to display in fullscreen mode</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Example Usage</h4>
                  <pre className="text-xs bg-black text-white p-2 rounded overflow-x-auto">
                    {`// Basic loading overlay
<LoadingModal isOpen={isLoading} />

// Custom message
<LoadingModal 
  isOpen={isLoading} 
  message="Uploading files..." 
/>

// Fullscreen for major operations
<LoadingModal 
  isOpen={isLoading} 
  message="Preparing workspace..." 
  fullScreen={true}
/>`}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* COLORS TAB */}
        <TabsContent value="colors" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">shadcn/ui Color System</h2>
            <p className="text-muted-foreground mb-6">
              The following colors are used throughout the CloudNotes application. This standardized color system ensures consistency across all components.
            </p>
          </div>
          
          {/* Color Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorClasses.map((color) => (
              <div 
                key={color.name}
                className="rounded-lg overflow-hidden border border-border"
              >
                <div 
                  className={`h-16 w-full ${color.class} flex items-center justify-center`}
                >
                  {color.class.includes('text-') && (
                    <div className="bg-background px-2 py-1 rounded">Sample Text</div>
                  )}
                </div>
                <div className="p-3 bg-card">
                  <p className="font-mono text-sm">{color.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{color.class}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Color Usage Examples */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">UI Components with Theme Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border">
                <h3 className="font-medium mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Primary</button>
                  <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md">Secondary</button>
                  <button className="bg-accent text-accent-foreground px-4 py-2 rounded-md">Accent</button>
                  <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md">Destructive</button>
                  <button className="bg-muted text-muted-foreground px-4 py-2 rounded-md">Muted</button>
                </div>
              </Card>
              
              <Card className="p-6 border-border">
                <h3 className="font-medium mb-4">Text Styles</h3>
                <div className="space-y-2">
                  <p className="text-foreground">Default text</p>
                  <p className="text-muted-foreground">Muted text</p>
                  <p className="text-primary">Primary text</p>
                  <p className="text-secondary">Secondary text</p>
                  <p className="text-accent">Accent text</p>
                  <p className="text-destructive">Destructive text</p>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Design System Information */}
          <Card className="p-6 mt-6 bg-muted/10">
            <h3 className="text-lg font-medium mb-4">About the Design System</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                CloudNotes uses the shadcn/ui design system with Tailwind CSS v4. This combination provides a consistent, 
                accessible, and customizable UI while maintaining excellent developer experience.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Semantic Colors</h4>
                  <p className="text-sm text-muted-foreground">
                    Colors are named by their function rather than their appearance, making theme switching and dark mode easier to implement.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Accessibility</h4>
                  <p className="text-sm text-muted-foreground">
                    All color combinations are tested for contrast to ensure they meet WCAG 2.1 AA standards.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Consistency</h4>
                  <p className="text-sm text-muted-foreground">
                    Using the same color variables throughout the application ensures visual harmony across all components.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
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
} 