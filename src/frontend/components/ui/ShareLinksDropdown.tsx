import React from 'react';
import {
  LinkIcon,
  Mail as MailIcon,
} from 'lucide-react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaTelegram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './dropdown-menu';
import { toast } from 'sonner';

interface ShareLinksDropdownProps {
  triggerText: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
  onCopyLink?: () => void;
  onFacebook?: () => void;
  onTwitter?: () => void;
  onTelegram?: () => void;
  onWhatsapp?: () => void;
  onEmail?: () => void;
}

const ShareLinksDropdown: React.FC<ShareLinksDropdownProps> = ({
  triggerText,
  triggerIcon = <LinkIcon size={16} />,
  triggerClassName = "gap-2 hover-primary-effect",
  onCopyLink,
  onFacebook,
  onTwitter,
  onTelegram,
  onWhatsapp,
  onEmail
}) => {
  // Default action to copy current page URL to clipboard
  const handleDefaultCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard", {
        description: "You can now paste it anywhere",
        icon: <LinkIcon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error("Failed to copy link", {
        description: "Please try again",
      });
    }
  };

  // Default actions to open social media platforms
  const handleDefaultFacebook = () => {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer');
  };

  const handleDefaultTwitter = () => {
    window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer');
  };

  const handleDefaultTelegram = () => {
    window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer');
  };

  const handleDefaultWhatsapp = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer');
  };

  const handleDefaultEmail = () => {
    window.open('mailto:?subject=' + encodeURIComponent(document.title) + '&body=' + encodeURIComponent(window.location.href), '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          {triggerIcon}
          {triggerText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Share via</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center hover-primary-effect"
          onClick={onCopyLink || handleDefaultCopyLink}
        >
          <LinkIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center hover-primary-effect"
          onClick={onFacebook || handleDefaultFacebook}
        >
          <FaFacebook className="mr-2 h-4 w-4 flex-shrink-0 text-[#1877F2]" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center hover-primary-effect"
          onClick={onTwitter || handleDefaultTwitter}
        >
          <FaTwitter className="mr-2 h-4 w-4 flex-shrink-0 text-[#1DA1F2]" />
          <span>X / Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center hover-primary-effect"
          onClick={onTelegram || handleDefaultTelegram}
        >
          <FaTelegram className="mr-2 h-4 w-4 flex-shrink-0 text-[#0088CC]" />
          <span>Telegram</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center hover-primary-effect"
          onClick={onWhatsapp || handleDefaultWhatsapp}
        >
          <FaWhatsapp className="mr-2 h-4 w-4 flex-shrink-0 text-[#25D366]" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center hover-primary-effect"
          onClick={onEmail || handleDefaultEmail}
        >
          <MailIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600" />
          <span>Email</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareLinksDropdown; 