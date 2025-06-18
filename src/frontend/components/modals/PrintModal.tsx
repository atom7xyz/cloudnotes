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
  title = "Termini di Servizio CloudNotes",
  lastUpdated = "10 Maggio 2024"
}: PrintModalProps) {
  
  const printDocument = () => {
    window.print();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Anteprima di Stampa"
      maxWidth="max-w-4xl"
      maxHeight="max-h-[calc(90vh-10rem)]"
      cancelButton={{
        text: "Annulla"
      }}
      actionButton={{
        text: "Stampa",
        onClick: printDocument,
        icon: <PrinterIcon size={16} />
      }}
    >
      <div className="p-8 print:p-0">
        <div className="print:max-w-none mx-auto print:mx-0">
          <h1 className="text-3xl font-bold mb-1 select-none">{title}</h1>
          <p className="text-sm text-foreground/80 mb-6 select-none">Ultimo aggiornamento: {lastUpdated}</p>
          
          {sections.map((section, index) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold mb-3 select-none">
                {index + 1}. {section.title}
              </h2>
              <div className="text-foreground">
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