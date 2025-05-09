
import React from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from "next/link";

interface NavItem {
  title: string;
  url?: string;
  component?: React.ComponentType<any>;
  icon?: LucideIcon;
}

interface NavSecondaryProps {
  items: NavItem[];
  activeItem: string | null;
  onSelectComponent: (
    title: string,
    callback: () => React.ComponentType<any> | null
  ) => void;
  className?: string;
}

export function NavSecondary({
  items,
  activeItem,
  onSelectComponent,
  className,
}: NavSecondaryProps) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
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
