"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import MapPanel from "@/components/widget/MapPanel";
import { BarChartPanel } from "@/components/widget/BarChartPanel";
import { Spinner } from "@/components/ui/spinner";
import FormSummaryTable from "@/components/data/FormSummaryTable";
import {
  fetchFormResponsesService,
  fetchFormsService,
} from "../api/services/formService";
import { FormSummary } from "@/types/form";

export default function DashboardHome() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
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
        const responses = await fetchFormResponsesService(form.id);
        const sortedResponses = [...responses].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const lastResponse =
          sortedResponses.length > 0
            ? sortedResponses[sortedResponses.length - 1]
            : null;

        const lastResponseUser =
          lastResponse?.user?.name || // Prefer user.name
          (lastResponse?.userId !== undefined // Check if userId exists
            ? String(lastResponse.userId) // Convert userId to string
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
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Wait for auth state to finish loading
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <p className="text-lg">Welcome to the AgriTech Dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-center">
        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <BarChartPanel />
          </div>
          <div className="flex-1">
            <FormSummaryTable
              summaryData={summaryData}
              loading={loading}
              error={error}
            />
          </div>
        </div>
        <div>
          <MapPanel />
        </div>
      </div>
    </div>
  );
}
