// src/app/dashboard/(main_dashboard)/responses/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "User Responses",
  description: "View and analyze collected form responses.",
};

export default function ResponsesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}