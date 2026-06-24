import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "drop.cv — Your name. Online. In 60 seconds.",
  description: "Upload your CV and get a professional resume site at yourname.drop.cv in under 60 seconds. No hosting. No code. No nonsense.",
  keywords: ["drop.cv", "resume site", "professional website", "CV hosting", "personal brand"],
  authors: [{ name: "drop.cv" }],
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#0F6E56",
  openGraph: {
    title: "drop.cv — Professional resume hosting",
    description: "Turn your CV into a live personal website instantly. Claim your name at drop.cv.",
    url: "https://drop.cv",
    siteName: "drop.cv",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "drop.cv — Professional resume hosting",
    description: "Turn your CV into a live personal website instantly. Claim your name at drop.cv.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
