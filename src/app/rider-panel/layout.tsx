import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Rider - Delivery Partner",
  description: "Superfast doorstep delivery rider console",
  manifest: "/manifest-rider.json",
  icons: {
    icon: "/logo-rider.png",
    shortcut: "/logo-rider.png",
    apple: "/logo-rider.png",
  }
};

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
