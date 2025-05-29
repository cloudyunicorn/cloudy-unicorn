import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sun,
  Moon,
  Monitor,
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  House,
  MenuIcon,
  HomeIcon,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { UserMetadata } from '@supabase/supabase-js';
import { TransitionStartFunction } from 'react';
import { Button } from '../ui/button';

export type MenuDropdownProps = {
  onSignOut: () => void;
  user: UserMetadata | null;
  isLoading: boolean;
  getInitials: (name?: string) => string;
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

export default function MenuDropdown({
  onSignOut,
  user,
  isLoading,
  getInitials,
  isPending,
  startTransition,
}: MenuDropdownProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-between space-x-2 border border-slate-700 rounded-full pl-1.5 pr-0.5 py-1 h-8 cursor-pointer">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 animate-[rotate-180_0.2s_ease-in-out_forwards,fade-in_0.2s_ease-in-out_forwards]" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
          <HomeIcon className="h-5 w-5" />
          <div className="w-7 h-7 rounded-full overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full">
                <Spinner size="sm" />
              </div>
            ) : (
              <Avatar className="h-full w-full">
                <AvatarImage src={user?.avatar_url} alt="User Avatar" />
                <AvatarFallback>
                  {getInitials(user?.name?.split(' ')[0])}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.avatar_url} alt="User Avatar" />
              <AvatarFallback className="rounded-lg">
                {getInitials(user?.name?.split(' ')[0])}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserCircleIcon className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <form
            action={onSignOut}
            className="w-full"
            onSubmit={() => startTransition(() => {})}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-sm"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Signing Out...
                </div>
              ) : (
                'Sign Out'
              )}
            </button>
          </form>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <div className="flex items-center justify-around px-2 py-1">
          <button
            onClick={() => setTheme('light')}
            className={`p-1 rounded hover:bg-accent ${theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
            aria-label="Light theme"
          >
            <Sun size={18} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1 rounded hover:bg-accent ${theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
            aria-label="Dark theme"
          >
            <Moon size={18} />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1 rounded hover:bg-accent ${theme === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
            aria-label="System theme"
          >
            <Monitor size={18} />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
