import { LogOut } from "lucide-react";
import { Button } from "./Button";
import { logOut as handleLogOut } from "@/lib/auth";

interface LogOutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogOutButton({
  variant = "outline",
  size = "default",
  className,
}: LogOutButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  );
}
