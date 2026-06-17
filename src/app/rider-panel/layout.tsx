import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Rider - Delivery Partner",
  description: "Superfast doorstep delivery rider console",
  manifest: "/manifest-rider.json",
};

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
