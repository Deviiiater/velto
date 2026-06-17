import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Rider - Delivery Partner",
  description: "Superfast doorstep delivery rider console",
  manifest: "/manifest-rider.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚴</text></svg>",
  }
};

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
