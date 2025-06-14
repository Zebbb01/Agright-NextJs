// src/app/dashboard/chart/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChartPanel } from "@/components/widget/graphs/BarChartPanel";
import { LineChartPanel } from "@/components/widget/graphs/LineChartPanel";
import FormSummaryTable from "@/components/data/FormSummaryTable"; // Import the new component
import {
  fetchFormsService,
  fetchFormResponsesService,
} from "@/app/api/services/formService"; // Import services
import { FormSummary } from "@/types/form";

export default function ChartPage() {
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
        // Fetch responses for each form to get the count
        // Note: This will make N+1 requests (1 for forms, N for responses per form).
        // For a large number of forms, consider optimizing this API call on the backend
        // to return forms with response counts directly.
        const responses = await fetchFormResponsesService(form.id); // Pass formId

        // You can add logic here to find the user of the last response if needed
        // For simplicity, we'll just get the count for now.
        // const lastResponse =
        //   responses.length > 0 ? responses[responses.length - 1] : null;

        // Ensure responses are sorted by createdAt before picking the last one
        // This is crucial if your API doesn't guarantee order.
        // Add this if you suspect sorting is the issue:

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

  return (
    <>
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChartPanel />
        <LineChartPanel />
      </div>
      <FormSummaryTable
        summaryData={summaryData}
        loading={loading}
        error={error}
      />
    </>
  );
}
