import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Partner - Store Manager",
  description: "Menu compiler, store orders compiler, and vendor dispatch console",
  manifest: "/manifest-vendor.json",
  icons: {
    icon: "/logo-vendor.png",
    shortcut: "/logo-vendor.png",
    apple: "/logo-vendor.png",
  }
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
