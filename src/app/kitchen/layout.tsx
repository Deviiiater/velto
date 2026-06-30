import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Kitchen - Order Preparer",
  description: "Cloud Kitchen order status and preparations manager console",
  manifest: "/manifest-kitchen.json",
  icons: {
    icon: "/logo-kitchen.png",
    shortcut: "/logo-kitchen.png",
    apple: [
      { url: "/logo-kitchen.png", sizes: "180x180", type: "image/png" }
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Velto Kitchen",
    statusBarStyle: "black-translucent",
  }
};

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
