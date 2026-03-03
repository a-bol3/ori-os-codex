import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ori-OS | The Unified Operating System for GTM Teams",
    template: "%s | Ori-OS",
  },
  description: "Consolidate your sales stack into a single, AI-powered platform.",
  keywords: [
    "sales intelligence",
    "lead enrichment",
    "workflow automation",
    "CRM",
    "analytics",
    "outreach",
    "AI-powered",
  ],
  authors: [{ name: "Ori-OS" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Ori-OS | The Unified Operating System for GTM Teams",
    description: "Consolidate your sales stack into a single, AI-powered platform.",
    url: "https://ori-os.com",
    siteName: "Ori-OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ori-OS | The Unified Operating System for GTM Teams",
    description: "Consolidate your sales stack into a single, AI-powered platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Sonner richColors position="top-right" />
      </body>
    </html>
  );
}
