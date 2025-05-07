'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BarChart3,
  MapPinned,
  FileEdit,
  FileText,
  ClipboardList,
  Users2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const groupedLinks = [
  {
    title: 'Dashboard',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Data Analytics & Mapping',
    links: [
      { href: '/dashboard/chart', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/map', label: 'Map', icon: MapPinned },
    ],
  },
  {
    title: 'Forms & Response',
    links: [
      { href: '/dashboard/form-builder', label: 'Form Builder', icon: FileEdit, admin: true },
      { href: '/dashboard/forms', label: 'Form', icon: FileText },
      { href: '/dashboard/responses', label: 'Responses', icon: ClipboardList },
    ],
  },
  {
    title: 'Administrator',
    links: [
      { href: '/dashboard/roles', label: 'Roles', icon: ShieldCheck, admin: true },
      { href: '/dashboard/users', label: 'Users', icon: Users2, admin: true },
    ],
  },
];

export default function Sidebar() {
  const isAdmin = true; // Simulated permission
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="w-64 bg-green-700 text-white p-6 shadow-md min-h-screen">
      <h2 className="text-2xl font-bold mb-6">AgriTech</h2>
      <nav className="flex flex-col gap-4">
        {groupedLinks.map(group => {
          const visibleLinks = group.links.filter(link => !link.admin || isAdmin);
          if (visibleLinks.length === 0) return null;

          const isOpen = openDropdowns[group.title];

          return (
            <div key={group.title}>
              <button
                className="flex items-center justify-between w-full text-left font-semibold hover:underline"
                onClick={() => toggleDropdown(group.title)}
              >
                <span>{group.title}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && (
                <div className="ml-3 mt-2 flex flex-col gap-2">
                  {visibleLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
