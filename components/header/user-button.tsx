"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';

const UserButton = () => {
  const { signOut } = useUser();

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relativee w-8 h-8 rounded-full ml-2 flex items-center justify-center"
            >
              U
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium leading-none">"User"</div>
              <div className="text-sm text-muted-foreground leading-none">
                "Email"
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem>
            <Link href="/user/profile" className="w-full">
              User Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/user/orders" className="w-full">
              Order History
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => signOut()}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
