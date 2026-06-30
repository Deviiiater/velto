import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Rider - Delivery Partner",
  description: "Superfast doorstep delivery rider console",
  manifest: "/manifest-rider.json",
  icons: {
    icon: "/logo-rider.png",
    shortcut: "/logo-rider.png",
    apple: [
      { url: "/logo-rider.png", sizes: "180x180", type: "image/png" }
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Velto Rider",
    statusBarStyle: "black-translucent",
  }
};

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
