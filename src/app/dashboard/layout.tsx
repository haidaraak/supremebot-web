import type { Metadata } from "next";

import { Guard } from "@/components/dash/Guard";
import { Sidebar, MobileBar } from "@/components/dash/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Guard>
      <div className="min-h-screen bg-bg">
        <Sidebar />
        <MobileBar />
        <main className="lg:ps-[248px]">
          <div className="mx-auto max-w-[1180px] px-5 pb-28 pt-8 sm:px-8 lg:pb-12">
            {children}
          </div>
        </main>
      </div>
    </Guard>
  );
}
