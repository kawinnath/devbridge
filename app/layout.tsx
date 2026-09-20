import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import OfflineNotice from "@/components/ui/OfflineNotice";

export const metadata: Metadata = {
  title: {
    default: "DevBridge | Connect Talent. Build What's Next.",
    template: "%s | DevBridge",
  },
  description: "DevBridge connects skilled developers with real-world projects from clients around the world. Direct client connections, transparent pricing, and zero platform commission.",
  keywords: ["freelance developers", "hire software engineers", "technology marketplace", "zero commission", "software project marketplace", "direct client connection"],
  authors: [{ name: "DevBridge Technologies" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.devbridge.in"),
  openGraph: {
    title: "DevBridge | Connect Talent. Build What's Next.",
    description: "DevBridge connects skilled developers with real-world projects from clients around the world.",
    url: "https://www.devbridge.in",
    siteName: "DevBridge",
    images: [
      {
        url: "/icon.jpg",
        width: 800,
        height: 800,
        alt: "DevBridge Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevBridge | Connect Talent. Build What's Next.",
    description: "DevBridge connects skilled developers with real-world projects from clients around the world.",
    images: ["/icon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <OfflineNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}
