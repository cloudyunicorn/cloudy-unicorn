'use client';

import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { data } from './AppSidebar';
import type { NavItem } from './AppSidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MobileNavbarProps {
  activeItem: string | null;
  onSelectComponent: (
    title: string, 
    callback: () => React.ComponentType<any> | null
  ) => void;
}

const MobileNavbar = ({ activeItem, onSelectComponent }: MobileNavbarProps) => {
  const isMobile = useIsMobile();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  if (!isMobile) return null;
  const visibleItems = data.navMain.slice(0, 5);
  const hiddenItems = data.navMain.slice(5);

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-50 bg-background border border-border shadow-lg rounded-xl">
      <div className="flex justify-around items-center h-16">
        {visibleItems.map((item: NavItem) => (
          <button
            key={item.title}
            className={cn(
              'flex flex-col items-center justify-center p-2 w-full',
              'text-muted-foreground hover:text-primary transition-colors',
              activeItem === item.title ? 'text-primary' : ''
            )}
            onClick={() => {
              if (item.component) {
                onSelectComponent(item.title, () => item.component!);
              }
            }}
          >
            {item.icon && (
              <span className="h-5 w-5">
                <item.icon size={20} />
              </span>
            )}
            <span className="text-xs mt-1">{item.title}</span>
          </button>
        ))}
        {hiddenItems.length > 0 && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex flex-col items-center justify-center p-2 w-full text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="h-5 w-5">...</span>
                <span className="text-xs mt-1">More</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1 mr-4 mb-2" align="center" side="top">
              <div className="flex flex-col">
                {hiddenItems.map((item: NavItem) => (
                  <button
                    key={item.title}
                    className={cn(
                      'flex items-center gap-3 p-3 w-full rounded-md',
                      'text-muted-foreground hover:text-primary hover:bg-accent transition-colors'
                    )}
                    onClick={() => {
                    setIsPopoverOpen(false);
                      if (item.component) {
                        onSelectComponent(item.title, () => item.component!);
                      }
                    }}
                  >
                    {item.icon && (
                      <span className={cn(
                        'h-5 w-5',
                        activeItem === item.title ? 'text-primary' : ''
                      )}>
                        <item.icon size={20} />
                      </span>
                    )}
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default MobileNavbar;
