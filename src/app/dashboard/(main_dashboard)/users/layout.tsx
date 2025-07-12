// src/app/dashboard/(main_dashboard)/users/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage application users and their profiles.",
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}