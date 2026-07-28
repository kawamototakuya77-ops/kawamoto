import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "ダッシュボード | 競艇直前物理AI",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
