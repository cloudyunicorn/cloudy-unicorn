'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { data } from './AppSidebar';
import type { NavItem } from './AppSidebar';

interface MobileNavbarProps {
  activeItem: string | null;
  onSelectComponent: (
    title: string, 
    callback: () => React.ComponentType<any> | null
  ) => void;
}

const MobileNavbar = ({ activeItem, onSelectComponent }: MobileNavbarProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16">
        {data.navMain.map((item: NavItem) => (
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
      </div>
    </div>
  );
};

export default MobileNavbar;
