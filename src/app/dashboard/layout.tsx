// src/app/dashboard/layout.tsx
'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Topbar from '@/components/app-topbar';

// Import LoadScript
import { LoadScript } from '@react-google-maps/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Set title based on pathname
  let title = 'Dashboard';
  if (pathname.includes('chart')) title = 'Crop Yield Chart';
  else if (pathname.includes('map')) title = 'Field Map View';
  else if (pathname.includes('forms')) title = 'Admin Forms';
  else if (pathname.includes('responses')) title = 'User Responses';
  else if (pathname.includes('archive')) title = 'Archive Forms/Responses';
  else if (pathname.includes('roles')) title = 'Role Management';
  else if (pathname.includes('users')) title = 'User Management';

  const isDashboardRoot = pathname === '/dashboard';

  return (
    // Wrap your entire layout content with LoadScript
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <SidebarProvider
      style={
                  {
                    '--sidebar-width': '12rem', // overide the default width
                  } as React.CSSProperties
                }>
        <div className="flex min-h-screen w-full h-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Topbar title={title} />
            <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4 sticky top-16 z-10 bg-background dark:bg-var(--background)">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList className=''>
                  {!isDashboardRoot && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="p-4 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </LoadScript>
  );
}