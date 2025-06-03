import { Card, CardContent } from './card';
import { cn } from '../../lib/utils';

interface AdBannerProps {
  type: 'horizontal' | 'vertical';
  className?: string;
  title?: string;
  description?: string;
}

const AdBanner = ({ type, className }: AdBannerProps) => {
  const isHorizontal = type === 'horizontal';
  
  // Placeholder dimensions based on ad type
  const dimensions = isHorizontal 
    ? { width: 728, height: 90 } // Standard leaderboard banner
    : { width: 300, height: 600 }; // Standard skyscraper banner

  // Generate placehold.co URL
  const placeholderUrl = `https://placehold.co/${dimensions.width}x${dimensions.height}/ffffff/999999?text=Ad`;

  return (
    <Card className={cn(
      "overflow-hidden border border-muted-foreground/20 bg-muted/10 cursor-pointer",
      isHorizontal ? "w-full h-32" : "w-full h-96",
      className
    )}>
      <CardContent className="p-0 h-full relative">
        {/* Placeholder Image */}
        <img 
          src={placeholderUrl}
          alt="Advertisement"
          className="w-full h-full object-cover cursor-pointer"
          loading="lazy"
        />
      </CardContent>
    </Card>
  );
};

export default AdBanner; 