import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Kitchen - Order Preparer",
  description: "Cloud Kitchen order status and preparations manager console",
  manifest: "/manifest-kitchen.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍳</text></svg>",
  }
};

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
