// src/app/dashboard/(main_dashboard)/chart/page.tsx
// This is now a Server Component (NO "use client" directive here)

import {
  fetchFormsService,
  fetchFormResponsesService,
} from "@/services"; // Ensure path is correct, e.g., '@/services/form'
import { FormSummary } from "@/types/form";
import ChartContent from "./_components/ChartContent"; // Import the new Client Component
import { Spinner } from "@/components/ui/spinner"; // Import for server-side loading fallback (optional)


// Data fetching function to run on the server
async function getChartData(): Promise<{ summaryData: FormSummary[]; error: string | null }> {
  try {
    const forms = await fetchFormsService();
    const newSummaryData: FormSummary[] = [];

    for (const form of forms) {
      // Ensure fetchFormResponsesService is correctly configured to make server-side fetches (absolute URLs)
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
        lastResponse?.user?.name ||
        (lastResponse?.userId !== undefined
          ? String(lastResponse.userId)
          : undefined) ||
        "N/A";

      newSummaryData.push({
        formId: form.id,
        formName: form.name,
        formDetails: form.details ?? "",
        responseCount: responses.length,
        lastResponseUser: lastResponseUser,
      });
    }
    return { summaryData: newSummaryData, error: null };
  } catch (err: any) {
    console.error("Error fetching chart data in Server Component:", err);
    // Return an error state to be handled in the UI
    return { summaryData: [], error: err.message || "Failed to fetch data." };
  }
}

export default async function ChartPage() {
  // Await data fetching directly in the Server Component
  const { summaryData, error } = await getChartData();

  // Handle server-side errors, for example, by displaying a message or redirecting
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <p className="text-xl font-semibold mb-2">Failed to load data for charts.</p>
        <p className="text-sm">{error}</p>
        {/* Optional: Add a retry button or more descriptive UI */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pass the server-fetched data to the Client Component */}
      <ChartContent initialSummaryData={summaryData} />
    </div>
  );
}