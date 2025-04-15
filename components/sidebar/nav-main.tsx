import React from 'react';
import { MailIcon, type LucideIcon } from 'lucide-react'; // Removed PlusCircleIcon as it's no longer directly used here
import { Button } from '@/components/ui/button';
import { BodyInfoDialog } from '@/components/body-info-dialog'; // Import the new component
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

interface NavItem {
  title: string;
  url?: string;
  component?: React.ComponentType<any>;
  icon?: LucideIcon;
}

interface NavMainProps {
  items: NavItem[];
  activeItem: string | null;
  onSelectComponent: (
    title: string,
    callback: () => React.ComponentType<any> | null
  ) => void;
}

export function NavMain({
  items,
  activeItem,
  onSelectComponent,
}: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* Replace Quick Create/Inbox with Body Info Dialog */}
          <SidebarMenuItem>
            <BodyInfoDialog />
          </SidebarMenuItem>
          {/* Removed the separate Inbox button item as well */}
        </SidebarMenu>
        <SidebarMenu>
          {/* Map over the dynamic items */}
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url ? (
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon size={20} />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => {
                    if (item.component) {
                      // Wrap the component in a callback so that state remains a function
                      onSelectComponent(item.title, () => item.component!);
                    }
                  }}
                  className={`${
                    activeItem === item.title
                      ? 'bg-sidebar-select'
                      : ''
                  }`}
                >
                  {item.icon && <item.icon size={20} />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
