// src/app/dashboard/(main_dashboard)/layout.tsx
'use client'; // This layout remains a Client Component because it uses hooks like usePathname

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
import { LoadScript } from '@react-google-maps/api';
import { BackToTopButton } from '@/components/ui/back-to-top-button';
import { motion } from 'framer-motion';

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // This getTitle function is primarily for the Topbar and Breadcrumbs UI
  const getTitleForUI = (path: string) => {
    if (path.includes('chart')) return 'Crop Yield Chart';
    if (path.includes('map')) return 'Field Map View';
    if (path.includes('forms')) return 'Admin Forms';
    if (path.includes('responses')) return 'User Responses';
    if (path.includes('archive')) return 'Archive Forms/Responses';
    if (path.includes('roles')) return 'Role Management';
    if (path.includes('users')) return 'User Management';
    return 'Dashboard'; // Default for /dashboard
  };

  const uiTitle = getTitleForUI(pathname);
  const isDashboardRoot = pathname === '/dashboard';

  const mainContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <SidebarProvider
        style={{ '--sidebar-width': '12rem' } as React.CSSProperties}
      >
        <div className="flex min-h-screen w-full h-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <div className="color-">
              <Topbar title={uiTitle} /> {/* Use uiTitle for Topbar */}
            </div>
            <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4 top-16 z-10 bg-background dark:bg-var(--background)">
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
                    <BreadcrumbPage>{uiTitle}</BreadcrumbPage> {/* Use uiTitle for Breadcrumb */}
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <motion.main
              className="p-4 flex-1 overflow-y-auto"
              initial="hidden"
              animate="visible"
              variants={mainContentVariants}
            >
              {children}
            </motion.main>
          </div>
        </div>
        <BackToTopButton />
      </SidebarProvider>
    </LoadScript>
  );
}