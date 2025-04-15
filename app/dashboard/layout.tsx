'use client';

import { AppSidebar, data } from '@/components/sidebar/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React, { useState } from 'react';
import { DashboardHeader } from "./dashboard-header";
import MobileNavbar from '@/components/sidebar/MobileNavbar';

const defaultItem = data.navMain.find((item) => item.title === 'Dashboard');

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ActiveComponent, setActiveComponent] =
    useState<React.ComponentType<any> | null>(() =>defaultItem?.component || null);

  const [activeItem, setActiveItem] = useState<string | null>(
    defaultItem?.title || null
  ); // Track active sidebar item

  function handleSelectComponent(
    title: string,
    component: () => React.ComponentType<any> | null
  ) {
    setActiveComponent(component);
    setActiveItem(title); // Set active sidebar item
  }

  return (
    <SidebarProvider>
      <AppSidebar
        items={data.navMain}
        activeItem={activeItem}
        onSelectComponent={handleSelectComponent}
        variant="inset"
      />
      <SidebarInset>
        <DashboardHeader activeItem={activeItem} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {ActiveComponent ? React.createElement(ActiveComponent) : children}
          </div>
        </div>
      </SidebarInset>
      <MobileNavbar 
        activeItem={activeItem}
        onSelectComponent={handleSelectComponent}
      />
    </SidebarProvider>
  );
}
