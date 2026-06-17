import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Partner - Store Manager",
  description: "Menu compiler, store orders compiler, and vendor dispatch console",
  manifest: "/manifest-vendor.json",
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
