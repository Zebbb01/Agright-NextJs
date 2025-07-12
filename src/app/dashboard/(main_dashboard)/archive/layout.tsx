// src/app/dashboard/(main_dashboard)/archive/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Archive Forms/Responses",
  description: "Manage archived forms and responses.",
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}