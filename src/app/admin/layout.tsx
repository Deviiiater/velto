import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto HQ - Administrator Operations",
  description: "Administrative core controller for Velto Instant Super App",
  manifest: "/manifest-admin.json",
  icons: {
    icon: "/logo-admin.png",
    shortcut: "/logo-admin.png",
    apple: "/logo-admin.png",
  },
  appleWebApp: {
    capable: true,
    title: "Velto Admin",
    statusBarStyle: "black-translucent",
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
