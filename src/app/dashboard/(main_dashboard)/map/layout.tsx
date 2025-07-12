// src/app/dashboard/(main_dashboard)/map/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Field Map View",
  description: "Visualize agricultural fields and data on a map.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}