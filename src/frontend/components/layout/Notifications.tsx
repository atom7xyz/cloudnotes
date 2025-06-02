import type React from 'react';
import { useState, useCallback } from 'react';
import { BellIcon, SettingsIcon, MessageSquareIcon, BookmarkIcon, Check } from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { cn } from '@/lib/utils';

// Types
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'comment' | 'bookmark_milestone';
  actionUrl?: string;
}

interface NotificationsProps {
  unreadCount?: number;
  notifications?: NotificationItem[];
  onOpenSettings?: () => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
}

// Sample notifications for bartsimpson user
const sampleNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New comment on your document',
    message: 'John Doe commented on "Wagner\'s Ring Cycle: A Complete Analysis"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    type: 'comment',
    actionUrl: '/document/wagner-ring-cycle'
  },
  {
    id: 'notif-2',
    title: 'Bookmark milestone reached!',
    message: 'Your document "Verdi\'s Italian Operas and Political Influence" has reached 50 bookmarks',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
    type: 'bookmark_milestone',
    actionUrl: '/document/verdi-italian-operas'
  },
  {
    id: 'notif-3',
    title: 'New comment on your document',
    message: 'Sarah Wilson commented on "Mozart\'s Operas: The Evolution of a Genius"',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    type: 'comment',
    actionUrl: '/document/mozart-operas'
  },
  {
    id: 'notif-4',
    title: 'Bookmark milestone reached!',
    message: 'Your document "Puccini and Italian Verismo: Realism in Opera" has reached 25 bookmarks',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    type: 'bookmark_milestone',
    actionUrl: '/document/puccini-verismo'
  },
  {
    id: 'notif-5',
    title: 'New comment on your document',
    message: 'Michael Chen commented on "The History of Opera Houses in Europe"',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    type: 'comment',
    actionUrl: '/document/opera-houses-europe'
  },
  {
    id: 'notif-6',
    title: 'Bookmark milestone reached!',
    message: 'Your document "Wagner\'s Ring Cycle: A Complete Analysis" has reached 100 bookmarks',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isRead: true,
    type: 'bookmark_milestone',
    actionUrl: '/document/wagner-ring-cycle'
  }
];

const Notifications: React.FC<NotificationsProps> = ({
  unreadCount = 2, // Default to 2 unread notifications for demo
  notifications = sampleNotifications, // Use sample notifications by default
  onOpenSettings,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Format the timestamp to a relative time string
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationItem['type']): React.ReactNode => {
    switch (type) {
      case 'comment':
        return <MessageSquareIcon size={14} className="text-green-500" />;
      case 'bookmark_milestone':
        return <BookmarkIcon size={14} className="text-blue-500" />;
      default:
        return <BellIcon size={14} className="text-gray-500" />;
    }
  };

  // Handle notification click
  const handleNotificationClick = useCallback((notification: NotificationItem) => {
    setIsOpen(false);
    onNotificationClick?.(notification);
  }, [onNotificationClick]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    setIsOpen(false);
    onMarkAllAsRead?.();
  }, [onMarkAllAsRead]);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setIsOpen(false);
    onOpenSettings?.();
  }, [onOpenSettings]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="p-1 h-8 w-8 rounded-full transition-all duration-200 hover-primary-effect relative"
          title="Notifications"
        >
          <BellIcon size={16} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 text-[10px] px-[5px] py-0 rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 select-none">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs flex items-center gap-1 hover-primary-effect"
              onClick={handleMarkAllAsRead}
            >
              <Check size={12} />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 px-2 flex flex-col items-center justify-center text-center">
            <BellIcon size={32} className="text-muted-foreground mb-2 opacity-20" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/70">We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto py-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 relative transition-all duration-200 hover-primary-effect",
                  notification.isRead ? "opacity-80" : "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1 rounded-full", 
                      notification.isRead ? "bg-muted/70" : "bg-muted"
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <span className={cn(
                      "text-sm",
                      notification.isRead ? "font-normal" : "font-medium"
                    )}>
                      {notification.title}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xs text-muted-foreground ml-2 transition-all duration-200",
                    notification.isRead ? "mr-0" : "mr-5"
                  )}>
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-7 pt-1">
                  {notification.message}
                </p>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary absolute top-3.5 right-2.5" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="p-2 hover-primary-effect cursor-pointer group"
          onClick={handleSettingsClick}
        >
          <div className="flex items-center gap-2 text-foreground w-full justify-center">
            <SettingsIcon size={14} />
            <span>Notification Settings</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications; 