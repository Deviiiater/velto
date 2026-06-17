import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto HQ - Administrator Operations",
  description: "Administrative core controller for Velto Instant Super App",
  manifest: "/manifest-admin.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>",
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
