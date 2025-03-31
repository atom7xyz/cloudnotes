import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { PrinterIcon } from "lucide-react";
import { Modal } from "../ui/modal";

// Section type definition
interface TosSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: TosSection[];
  title: string;
  lastUpdated: string;
}

export default function PrintModal({ 
  isOpen, 
  onClose, 
  sections,
  title = "CloudNotes Terms of Service",
  lastUpdated = "May 10, 2024"
}: PrintModalProps) {
  
  const printDocument = () => {
    window.print();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Preview"
      maxWidth="max-w-4xl"
      maxHeight="max-h-[calc(90vh-10rem)]"
      footer={
        <div className="flex justify-end items-center gap-2 select-none">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-full cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            onClick={printDocument}
            className="rounded-full flex items-center gap-2 !px-8 cursor-pointer"
          >
            <PrinterIcon className="size-4" />
            Print
          </Button>
        </div>
      }
    >
      <div className="p-8 print:p-0">
        <div className="print:max-w-none mx-auto print:mx-0">
          <h1 className="text-3xl font-bold mb-1 select-none">{title}</h1>
          <p className="text-sm text-black mb-6 select-none">Last updated: {lastUpdated}</p>
          
          {sections.map((section, index) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold mb-3 select-none">
                {index + 1}. {section.title}
              </h2>
              <div className="text-black">
                {section.content}
              </div>
              {index < sections.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
} 