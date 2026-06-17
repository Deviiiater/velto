import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Warehouse - Packing Console",
  description: "Topological packing and dark store supply dispatcher console",
  manifest: "/manifest-warehouse.json",
};

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
