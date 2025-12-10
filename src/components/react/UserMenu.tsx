import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";

interface UserMenuProps {
  name?: string | null;
  username?: string;
  email?: string | null;
}

export function UserMenu({ name, username, email }: UserMenuProps) {
  const displayName = name || username;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email
      ? email[0].toUpperCase()
      : "U";
  const handleSignOut = async () => {
    const callbackUrl = new URL(window.location.origin);
    callbackUrl.searchParams.set("toastSuccess", "logout");
    await window.signOut({
      // @ts-ignore
      callbackUrl: callbackUrl.href,
    });
  }

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-brand-teal-50 bg-brand-teal-50 hover:bg-brand-teal-70 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal-50 focus:ring-offset-2">
            {initials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName || "User"}
              </p>
              {email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
