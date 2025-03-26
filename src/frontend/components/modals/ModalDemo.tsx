import { useState } from "react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { 
  PlusIcon, 
  PrinterIcon, 
  SettingsIcon, 
  InfoIcon,
  ExpandIcon,
  MaximizeIcon,
  MinimizeIcon
} from "lucide-react";

export default function ModalDemo() {
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isCustomHeaderModalOpen, setIsCustomHeaderModalOpen] = useState(false);
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isCustomSizeModalOpen, setIsCustomSizeModalOpen] = useState(false);
  const [isScrollingContentModalOpen, setIsScrollingContentModalOpen] = useState(false);
  
  return (
    <div className="p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Modal Component Showcase</h1>
        <p className="text-lg text-muted-foreground mb-6">
          This page demonstrates the various configurations of our Modal component.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Modal */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <InfoIcon size={20} />
            Basic Modal
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
            Custom Header
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
            With Footer
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
            Custom Size
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
            Scrolling Content
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
            Fullscreen
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
    </div>
  );
} 