import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./(auth)/providers"; // Import the centralized Providers
import { PageLoadingSpinnerAdvanced } from "@/components/page-loading-spinner-advanced";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agright Technologies",
    template: "%s | Agright Technologies", // Dynamic title based on sub-pages
  },
  description: "Website for Agright Technologies, empowering agriculture with technology.",
  // Add more metadata for SEO, e.g., keywords, openGraph, twitter, etc.
  keywords: ["agriculture", "technology", "agritech", "chart", "dashboard"],
  openGraph: {
    title: "Agright Technologies",
    description: "Empowering agriculture with technology.",
    url: "https://www.agrighttech.com", // Replace with your actual URL
    siteName: "Agright Technologies",
    images: [
      {
        url: "https://www.agrighttech.com/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "Agright Technologies",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agright Technologies",
    description: "Empowering agriculture with technology.",
    creator: "@AgrightTech", // Replace with your Twitter handle
    images: ["https://www.agrighttech.com/twitter-image.jpg"], // Replace with your actual Twitter image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers> {/* Wrap with NextAuth.js Providers */}
          {children}
          <Toaster />
          {/* Consider if PageLoadingSpinnerAdvanced is truly global or specific to certain routes.
              For route-based loading, Next.js's loading.tsx is often preferred. */}
          <PageLoadingSpinnerAdvanced />
        </Providers>
      </body>
    </html>
  );
}