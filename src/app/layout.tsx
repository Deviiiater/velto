import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { Navbar } from "@/components/Navbar";
import { SplashLoader } from "@/components/SplashLoader";
import { ActiveOrderFloatingBar } from "@/components/ActiveOrderFloatingBar";
import { FloatingCartBar } from "@/components/FloatingCartBar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BottomNavBar } from "@/components/BottomNavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.velto.delivery'),
  title: "Velto - 10-Min Instant Delivery",
  description: "Get fresh groceries, restaurant meals, medicines, and daily essentials delivered to your doorstep in 10 minutes by Velto.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: 'https://www.velto.delivery',
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ['Velto', 'Instant Delivery', '10-minute delivery', 'food delivery', 'groceries online', 'quick commerce', 'Lucknow delivery', 'medicines delivery', 'PWA delivery app'],
  openGraph: {
    title: 'Velto - 10-Min Instant Delivery',
    description: 'Get fresh groceries, restaurant meals, medicines, and daily essentials delivered in under 10 minutes.',
    url: 'https://www.velto.delivery',
    siteName: 'Velto',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Velto Instant Delivery',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velto - 10-Min Instant Delivery',
    description: 'Groceries, meals, and essentials delivered in 10 minutes.',
    images: ['/logo.png'],
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DeliveryService",
              "name": "Velto",
              "url": "https://www.velto.delivery",
              "logo": "https://www.velto.delivery/logo.png",
              "description": "Get fresh groceries, restaurant meals, medicines, and daily essentials delivered to your doorstep in 10 minutes by Velto.",
              "areaServed": {
                "@type": "Country",
                "name": "India"
              },
              "priceRange": "$$"
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        <Providers>
          <SplashLoader />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 pb-28">
            {children}
          </main>
          <ActiveOrderFloatingBar />
          <FloatingCartBar />
          <BottomNavBar />
          <footer className="border-t border-border bg-card pt-6 px-6 pb-28 text-center text-muted-foreground text-sm">
            &copy; 2026 Velto Platform. All rights reserved.
          </footer>
        </Providers>
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
