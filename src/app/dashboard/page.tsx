// src/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import MapPanel from "@/components/widget/MapPanel";
import { BarChartPanel } from "@/components/widget/graphs/BarChartPanel";
import { Spinner } from "@/components/ui/spinner";
import FormSummaryTable from "@/components/data/FormSummaryTable";
import {
  fetchFormResponsesService,
  fetchFormsService,
} from "../api/services/formService";
import { FormSummary } from "@/types/form";
import { LineChartPanel } from "@/components/widget/graphs/LineChartPanel";
import { RadialChartPanel } from "@/components/widget/graphs/RadialChartPanel";
import { ArialChartPanel } from "@/components/widget/graphs/ArialChartPanel";

export default function DashboardHome() {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data and status

  const [summaryData, setSummaryData] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const forms = await fetchFormsService();
      const newSummaryData: FormSummary[] = [];

      for (const form of forms) {
        // Ensure fetchFormResponsesService can handle `userId` as a string if it's used there
        const responses = await fetchFormResponsesService(form.id);
        const sortedResponses = [...responses].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const lastResponse =
          sortedResponses.length > 0
            ? sortedResponses[sortedResponses.length - 1]
            : null;

        // Ensure user.name is accessed safely from the response
        const lastResponseUser =
          lastResponse?.user?.name || // Prefer user.name
          (lastResponse?.userId !== undefined // Check if userId exists
            ? String(lastResponse.userId) // userId is already string, but casting ensures safety
            : undefined) || // If userId is undefined, fall through
          "N/A"; // Fallback if nothing else works

        newSummaryData.push({
          formId: form.id,
          formName: form.name,
          formDetails: form.details ?? "",
          responseCount: responses.length,
          lastResponseUser: lastResponseUser, // Always a string
        });
      }
      setSummaryData(newSummaryData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch data if authenticated and not currently loading auth state
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]); // Depend on status to trigger data fetch

  useEffect(() => {
    // Handle redirection based on authentication status
    if (status === "loading") {
      return; // Do nothing while the session is still loading
    }
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect unauthenticated users
    }
  }, [status, router]);

  // Show loading spinner while authentication status is being determined
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  // If unauthenticated, return null as the useEffect will handle the redirect
  if (status === "unauthenticated") {
    return null;
  }

  // If authenticated, render the dashboard content
  return (
    <div className="space-y-6">
      <p className="text-lg">Welcome to the AgriTech Dashboard</p>

      {/*--------- Container ---------*/}
      <div className="grid grid-rows-1 space-y-3">
        {/*--------- First Row ---------*/}
        <div className="grid grid-cols-[4fr_2fr] gap-3">
          {/* Memory/Cpu, Login & Server Request Container */}
          <div className="grid grid-rows-1 gap-3">
            {/* Memory/Cpu & Login Row */}
            <div className="grid grid-cols-2 gap-3">
              <LineChartPanel />
              <LineChartPanel />
            </div>

            {/* Server Request Row */}
            {/* <div className="grid grid-cols-1 gap-3">
              <BarChartPanel />
            </div> */}
          </div>
          {/* End of Memory/Cpu, Login & Server Request Container */}

          {/* Memory & Google hits Container */}
          <div className="grid grid-rows-1 gap-3">
            {/* Memory & Google hits Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Memory & Google hits Row */}
              <div className="grid grid-rows-2 gap-3">
                <RadialChartPanel />
                <RadialChartPanel />
              </div>
              {/* Support calls & Sign ups Row */}
              <div className="grid grid-rows-2 gap-3">
                <RadialChartPanel />
                <RadialChartPanel />
              </div>
            </div>

            {/* Google Hits Request Row */}
            {/* <div className="grid grid-cols-1 gap-3">
              <LineChartPanel />
            </div> */}
          </div>
          {/* End of Memory & Google hits Container */}
        </div>

        {/* --------- Second Row --------- */}
        <ArialChartPanel />
        <div className="grid grid-cols-2 gap-3">
          <FormSummaryTable
            summaryData={summaryData}
            loading={loading}
            error={error}
          />
          <MapPanel />
        </div>
      </div>
    </div>
  );
}
