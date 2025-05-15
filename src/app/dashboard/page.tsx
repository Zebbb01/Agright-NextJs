"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import MapPanel from "@/components/widget/MapPanel";
import ResponsesTable from "@/components/table/ResponsesTable";
import { BarChartPanel } from "@/components/widget/BarChartPanel";

export default function DashboardHome() {
  // const { isAuthenticated } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/login");
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <p className="text-lg">Welcome to the AgriTech Dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-center">
        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <BarChartPanel />
          </div>
          <div className="flex-1">
            <ResponsesTable isAdmin={true} />
          </div>
        </div>
        <div>
          <MapPanel />
        </div>
      </div>
    </div>
  );
}
