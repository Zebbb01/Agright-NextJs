// src/app/dashboard/layout.tsx
'use client'; // Mark this file as a client component

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { usePathname } from 'next/navigation'; // Use `usePathname` from next/navigation instead

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the pathname from `usePathname` in client components

  // Set the title based on the current pathname
  let title = "Dashboard"; // Default title

  if (pathname.includes('chart')) title = "Crop Yield Chart";
  if (pathname.includes('map')) title = "Field Map View";
  if (pathname.includes('form-builder')) title = "Form Builder";
  if (pathname.includes('forms')) title = "Admin Forms";
  if (pathname.includes('responses')) title = "User Responses";
  if (pathname.includes('roles')) title = "Role Management";
  if (pathname.includes('users')) title = "User Management";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={title} /> {/* Pass the title as a prop */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
