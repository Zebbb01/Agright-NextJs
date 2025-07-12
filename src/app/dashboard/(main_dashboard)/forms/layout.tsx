// src/app/dashboard/(main_dashboard)/forms/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Forms",
  description: "Create and manage agricultural data collection forms.",
};

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}