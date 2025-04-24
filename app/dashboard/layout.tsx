'use client';

import { AppSidebar, data } from '@/components/sidebar/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './dashboard-header';
import MobileNavbar from '@/components/sidebar/MobileNavbar';
import { DataProvider } from '@/contexts/DataContext';
import { Spinner } from '@/components/ui/spinner';

const defaultItemTitle = 'Dashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [ActiveComponent, setActiveComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  useEffect(() => {
    const storedItemTitle = localStorage.getItem('activeDashboardItem');
    const initialItemTitle = storedItemTitle || defaultItemTitle;
    const initialItem = data.navMain.find(
      (item) => item.title === initialItemTitle
    );

    if (initialItem) {
      setActiveItem(initialItem.title);
      setActiveComponent(() => initialItem.component || null);
    } else {
      const defaultItem = data.navMain.find(
        (item) => item.title === defaultItemTitle
      );
      if (defaultItem) {
        setActiveItem(defaultItem.title);
        setActiveComponent(() => defaultItem.component || null);
        localStorage.setItem('activeDashboardItem', defaultItem.title);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (activeItem) {
      localStorage.setItem('activeDashboardItem', activeItem);
    }
  }, [activeItem]);

  function handleSelectComponent(
    title: string,
    component: () => React.ComponentType<any> | null
  ) {
    setActiveComponent(component);
    setActiveItem(title);
  }

  return (
    <DataProvider>
      <SidebarProvider>
        <AppSidebar
          items={data.navMain}
          activeItem={activeItem}
          onSelectComponent={handleSelectComponent}
          variant="inset"
        />
        <SidebarInset>
          <DashboardHeader activeItem={activeItem} />
          <div className="flex flex-1 flex-col mb-16 md:mb-0">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="@container/main flex flex-1 flex-col gap-2">
                {ActiveComponent ? React.createElement(ActiveComponent) : children}
              </div>
            )}
          </div>
        </SidebarInset>
        <MobileNavbar
          activeItem={activeItem}
          onSelectComponent={handleSelectComponent}
        />
      </SidebarProvider>
    </DataProvider>
  );
}
