// src/app/dashboard/(main_dashboard)/roles/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Role Management",
  description: "Manage user roles and permissions.",
};

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}