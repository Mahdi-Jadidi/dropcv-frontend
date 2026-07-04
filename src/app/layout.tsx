import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "drop.cv — رزومه شما، یک وب‌سایت حرفه‌ای",
  description: "رزومه خود را به یک وب‌سایت حرفه‌ای تبدیل کنید؛ پیش‌نمایش رایگان و انتشار با آدرس شخصی drop.cv.",
  keywords: ["drop.cv", "resume site", "professional website", "CV hosting", "personal brand"],
  authors: [{ name: "drop.cv" }],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "drop.cv — Turn your CV into a professional website",
    description: "Create a private preview free, then publish at your personal drop.cv address.",
    url: "https://drop.cv",
    siteName: "drop.cv",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "drop.cv — Turn your CV into a professional website",
    description: "Create a private preview free, then publish at your personal drop.cv address.",
  },
};

export const viewport: Viewport = { themeColor: "#0F6E56" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
