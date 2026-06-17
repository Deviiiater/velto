import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { Navbar } from "@/components/Navbar";
import { SplashLoader } from "@/components/SplashLoader";
import { ActiveOrderFloatingBar } from "@/components/ActiveOrderFloatingBar";
import { FloatingCartBar } from "@/components/FloatingCartBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velto - Instant Delivery",
  description: "Groceries and essentials delivered in 10 minutes by Velto",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        <Providers>
          <SplashLoader />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
            {children}
          </main>
          <ActiveOrderFloatingBar />
          <FloatingCartBar />
          <footer className="border-t border-border bg-card p-6 text-center text-muted-foreground text-sm">
            &copy; 2026 Velto Platform. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
