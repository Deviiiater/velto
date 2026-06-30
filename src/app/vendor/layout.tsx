import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Partner - Store Manager",
  description: "Menu compiler, store orders compiler, and vendor dispatch console",
  manifest: "/manifest-vendor.json",
  icons: {
    icon: "/logo-vendor.png",
    shortcut: "/logo-vendor.png",
    apple: [
      { url: "/logo-vendor.png", sizes: "180x180", type: "image/png" }
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Velto Partner",
    statusBarStyle: "black-translucent",
  }
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
