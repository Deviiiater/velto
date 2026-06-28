import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Warehouse - Packing Console",
  description: "Topological packing and dark store supply dispatcher console",
  manifest: "/manifest-warehouse.json",
  icons: {
    icon: "/logo-warehouse.png",
    shortcut: "/logo-warehouse.png",
    apple: "/logo-warehouse.png",
  }
};

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
