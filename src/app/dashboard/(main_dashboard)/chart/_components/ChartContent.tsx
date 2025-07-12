// src/app/dashboard/(main_dashboard)/chart/_components/ChartContent.tsx
"use client"; // This is a Client Component

import { useState } from "react";
import FormSummaryTable from "@/components/data/FormSummaryTable";
import { FormSummary } from "@/types/form";
import FormBlockSummary from "@/components/data/FormBlockSummary";
import ChartsPageGraphs from "@/components/widget/graphs/ChartsPageGraphs";
// No need for Spinner import here unless it's specifically for FormBlockSummary's internal loading

type ChartContentProps = {
  initialSummaryData: FormSummary[];
};

export default function ChartContent({ initialSummaryData }: ChartContentProps) {
  // Initialize state with data passed from the Server Component
  const [summaryData, setSummaryData] = useState<FormSummary[]>(initialSummaryData);
  // `loading` and `error` states are managed internally by FormSummaryTable or FormBlockSummary if they refetch.
  // We can remove these here as the initial fetch is done by the Server Component.
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"charts" | "table" | "block-summary">("charts");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const handleViewFormBlocks = (formId: string) => {
    setSelectedFormId(formId);
    setActiveTab("block-summary");
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === "charts"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("charts")}
        >
          Charts
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === "table"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("table")}
        >
          Summary Table
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === "block-summary"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("block-summary")}
        >
          Block Summary
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "charts" && <ChartsPageGraphs />}

        {activeTab === "table" && (
          <FormSummaryTable
            summaryData={summaryData}
            // `loading` and `error` should now primarily be handled within FormSummaryTable
            // if it has internal loading states for filtering/sorting etc.
            // If it just displays the initialSummaryData, these props might be removed from here.
            loading={false} // Initial data is already loaded
            error={null} // Initial error handled by parent Server Component
            onViewFormBlocks={handleViewFormBlocks}
          />
        )}

        {activeTab === "block-summary" && (
          <FormBlockSummary
            selectedFormId={selectedFormId}
            onBackToSummary={() => setActiveTab("table")}
          />
        )}
      </div>
    </div>
  );
}