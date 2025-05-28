'use client';

import MenuDropdown from "@/components/header/menu-mob";
import Modetoggle from '@/components/header/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { signOutAction } from "@/lib/actions/user.action";
import { useUser } from '@/contexts/UserContext';
import { useEffect, useTransition } from 'react';

function getInitials(name?: string) {
  if (!name) return 'US';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface DashboardHeaderProps {
  activeItem: string | null;
}

export function DashboardHeader({ activeItem }: DashboardHeaderProps) {
  const { user, isLoading, refreshUser } = useUser();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user && !isLoading) {
      refreshUser();
    }
  }, [user, isLoading, refreshUser]);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex justify-between items-center w-full">
          <h1 className="text-base font-medium">{activeItem}</h1>
          <div className="md:hidden">
            <MenuDropdown
              onSignOut={signOutAction}
              user={user}
              isLoading={isLoading}
              getInitials={getInitials}
              isPending={isPending}
              startTransition={startTransition}
            />
          </div>
          <div className="hidden md:block">
            <Modetoggle />
          </div>
        </div>
      </div>
    </header>
  );
}
