'use client';

import { usePathname } from 'next/navigation';

export default function DashboardContent() {
  const pathname = usePathname();
  let content = <p>Welcome to the AgriTech Dashboard</p>;

  if (pathname.includes('chart')) content = <p>Static Chart View</p>;
  if (pathname.includes('map')) content = <p>Static Map View</p>;
  if (pathname.includes('forms')) content = <p>Static Forms Created by Admin</p>;
  if (pathname.includes('responses')) content = <p>Static User Responses</p>;
  if (pathname.includes('roles')) content = <p>Static Role Management</p>;
  if (pathname.includes('users')) content = <p>Static User Management</p>;

  return <main className="p-6 flex-1">{content}</main>;
}
