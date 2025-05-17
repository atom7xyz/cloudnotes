import { UploadIcon } from 'lucide-react';
import {
  Card,
  CardContent
} from '../ui/card';
import { Button } from '../ui/button';

interface UploadCardProps {
  className?: string;
}

/**
 * UploadCard component that displays a card with upload functionality
 * for documents. Used on the homepage and potentially other places.
 */
const UploadCard = ({ className = '' }: UploadCardProps) => {
  return (
    <Card className={`bg-primary/5 border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <UploadIcon size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Upload Your Document</h3>
        <p className="text-center text-muted-foreground mb-4 max-w-md">
          Share your knowledge with the CloudNotes community. 
          Upload PDFs, Word documents, presentations, and more.
        </p>
        <div className="flex gap-4">
          <Button className="gap-2">
            <UploadIcon size={16} />
            Upload Document
          </Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadCard; 