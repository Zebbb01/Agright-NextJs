"use client";

import { DataTable } from "../data-table";
import { DataTableColumn } from "@/types/data-table";
import { FormSummary, FormSummaryTableProps } from "@/types/form"; // Adjust the import path as necessary

export default function FormSummaryTable({
  summaryData,
  loading,
  error,
}: FormSummaryTableProps) {
  // Define columns for the FormSummaryTable
  const columns: DataTableColumn<FormSummary>[] = [
    { header: "Form Name", accessor: "formName", className: "font-medium" },
    {
      header: "Details",
      accessor: "formDetails",
      enableTooltip: true,
    },
    {
      header: "Last Response User",
      accessor: (summary) => summary.lastResponseUser || "-",
    },
    { header: "Response Count", accessor: "responseCount" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Form Responses Summary</h2>
      <DataTable<FormSummary>
        columns={columns}
        data={summaryData}
        isLoading={loading}
        isError={!!error} // Convert error string to boolean
        errorMessage={error || "Failed to load summary data."}
        noDataMessage="No forms found or no responses recorded."
        renderRowActions={undefined}
        pagination={{
          currentPage: 1, // Default or actual page
          totalPages: 1, // Default or actual total pages
          onPreviousPage: () => {}, // Dummy function
          onNextPage: () => {}, // Dummy function
          totalItems: summaryData.length, // The crucial part for the footer
        }}
      />
    </div>
  );
}