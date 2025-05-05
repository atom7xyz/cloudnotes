import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ApplicationSplashProps {
  isOpen: boolean;
  message?: string;
}

const ApplicationSplash: React.FC<ApplicationSplashProps> = ({
  isOpen,
  message = "Getting things ready..."
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
      aria-modal="true"
    >
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md px-8">
        {/* App Name with the same font as TopNavbar */}
        <motion.h1 
          className="font-bigshot-one italic text-primary text-6xl tracking-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          CloudNotes
        </motion.h1>
        
        {/* Loading message */}
        <motion.p 
          className="text-lg text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {message}
        </motion.p>
        
        {/* Loading spinner animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-4"
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ApplicationSplash; 