"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react"; // Import useSession

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  BarChart3,
  MapPinned,
  FileEdit,
  ClipboardList,
  Users2,
  ShieldCheck,
  ArchiveIcon,
} from "lucide-react";
import { Spinner } from "./ui/spinner";

// Define an interface for your link structure to include 'roles'
interface SidebarLink {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: string[]; // Add an optional 'roles' array for specific role access
}

// Update groupedLinks to use the new interface and define required roles
const groupedLinks: { title: string; links: SidebarLink[] }[] = [
  {
    title: "Dashboard",
    links: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Data Analytics & Mapping",
    links: [
      { title: "Analytics", url: "/dashboard/chart", icon: BarChart3 },
      { title: "Map", url: "/dashboard/map", icon: MapPinned },
    ],
  },
  {
    title: "Forms & Response",
    links: [
      // Only 'Admin' can see 'Form'
      { title: "Form", url: "/dashboard/forms", icon: FileEdit, roles: ["Admin"] },
      { title: "Responses", url: "/dashboard/responses", icon: ClipboardList },
      { title: "Archive", url: "/dashboard/archive", icon: ArchiveIcon, roles: ["Admin"] },
    ],
  },
  {
    title: "Administrator",
    links: [
      // Only 'Admin' can see 'Roles'
      { title: "Roles", url: "/dashboard/roles", icon: ShieldCheck, roles: ["Admin"] },
      // Only 'Admin' can see 'Users'
      { title: "Users", url: "/dashboard/users", icon: Users2, roles: ["Admin"] },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session, status } = useSession(); // Get session data and loading status

  // Determine the current user's role (default to null or 'Guest' if not authenticated)
  const userRole = session?.user?.role || null; // Access the role from the session

  // You can define helper functions or direct checks for specific roles
  const hasAccess = (requiredRoles?: string[]) => {
    // If no specific roles are required, always grant access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    // If the user is not logged in, they don't have access to role-restricted links
    if (!userRole) {
      return false;
    }
    // Check if the user's role is in the list of required roles
    return requiredRoles.includes(userRole);
  };


  // Show a loading state or null if session is not yet loaded
  // if (status === "loading") {
  //   return <Spinner />; // Or a loading spinner/skeleton
  // }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" />
            <h1 className="text-lg font-bold">AgriTech</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {groupedLinks.map((group) => {
          // Filter links based on the user's role
          const visibleLinks = group.links.filter((link) => hasAccess(link.roles));

          // If no links are visible in this group, don't render the group title or content
          if (visibleLinks.length === 0) return null;

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleLinks.map(({ title, url, icon: Icon }) => {
                    const isActive = pathname === url;
                    return (
                      <SidebarMenuItem key={url}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={url} className="flex items-center gap-2">
                            <Icon size={16} />
                            {title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}