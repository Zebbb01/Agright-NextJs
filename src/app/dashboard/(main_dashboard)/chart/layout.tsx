// src\app\dashboard\(main_dashboard)\chart\layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Analytics & Chart", // This is fine
  description: "Chart & Analytics for AgriTech application.",
};

export default function ChartRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}