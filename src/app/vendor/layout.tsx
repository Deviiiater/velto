import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Partner - Store Manager",
  description: "Menu compiler, store orders compiler, and vendor dispatch console",
  manifest: "/manifest-vendor.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏪</text></svg>",
  }
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
