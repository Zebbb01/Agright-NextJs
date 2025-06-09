// src/components/app-topbar.tsx
"use client";

import { useDarkMode } from "@/hooks/useDarkMode";
import { Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut from NextAuth.js

export default function Topbar({ title }: { title: string }) {
  const { isDark, toggle } = useDarkMode();
  const { data: session, status } = useSession(); // Get session data and status
  const router = useRouter();
  const pathname = usePathname();

  // Check if session is loading or if user is authenticated
  const isAuthenticated = status === "authenticated";
  const user = session?.user; // Access user data from session

  const handleLogout = async () => {
    await signOut({ redirect: false }); // Use NextAuth.js signOut
    router.push("/login");
  };

  const isOnDashboard = pathname?.startsWith("/dashboard");

  return (
    <div className="bg-sidebar text-sidebar-foreground p-4 flex w-full items-center justify-between sticky top-0 z-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="bg-sidebar text-sidebar-foreground hover:bg-[var(--sidebar-hover)] rounded-full p-2 transition"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Render dropdown only if authenticated, on dashboard, and user data is available */}
        {isAuthenticated && isOnDashboard && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-center">
              <div className="px-3 py-2">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {/* Access the role directly from the session user object */}
                      {user.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenuItem
                onClick={handleLogout}
                className="justify-center"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}