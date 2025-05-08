"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
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
  FileText,
  ClipboardList,
  Users2,
  ShieldCheck,
} from "lucide-react";

// Simulated user permission
const isAdmin = true;

const groupedLinks = [
  {
    title: "Dashboard",
    links: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
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
      { title: "Form", url: "/dashboard/forms", icon: FileEdit, admin: true },
      { title: "Responses", url: "/dashboard/responses", icon: ClipboardList },
    ],
  },
  {
    title: "Administrator",
    links: [
      { title: "Roles", url: "/dashboard/roles", icon: ShieldCheck, admin: true },
      { title: "Users", url: "/dashboard/users", icon: Users2, admin: true },
    ],
  },
];


export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props} className="w-64 border-r">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" /> {/* Replace with your actual path and styling */}
            <h1 className="text-lg font-bold">AgriTech</h1>
          </div>
        </div>
        {/* <VersionSwitcher
          versions={["1.0.1", "1.1.0-alpha", "2.0.0-beta1"]}
          defaultVersion="1.0.1"
        /> */}
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {groupedLinks.map((group) => {
          const visibleLinks = group.links.filter((link) => !link.admin || isAdmin);
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
