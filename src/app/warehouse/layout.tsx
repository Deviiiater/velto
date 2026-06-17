import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velto Warehouse - Packing Console",
  description: "Topological packing and dark store supply dispatcher console",
  manifest: "/manifest-warehouse.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📦</text></svg>",
  }
};

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
