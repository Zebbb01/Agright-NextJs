"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ExtendedResponsesTableProps, FormResponse } from "@/types/form";
import { DataTable } from "../data-table";
import { DataTableColumn } from "../../types/data-table"; // Correct path to your reusable DataTable
// TableCell and TableRow are no longer needed here as DataTable encapsulates them

export default function ResponsesTable({
  responses,
  paginatedResponses,
  currentPage,
  totalPages,
  loading,
  error,
  allFieldLabels,
  isAdmin,
  handleDeleteResponse,
  handlePreviousPage,
  handleNextPage,
}: ExtendedResponsesTableProps) {
  // Dynamically define columns for the DataTable
  const columns: DataTableColumn<FormResponse>[] = [
    { header: "Response ID", accessor: "id", className: "font-medium" },
    {
      header: "User",
      accessor: (response) => response.user?.name || response.userId,
    },
  ];

  // Add dynamic columns for each field label
  allFieldLabels.forEach((label) => {
columns.push({
  header: label,
  accessor: (response) =>
    Array.isArray(response.values[label])
      ? response.values[label].join(", ")
      : response.values[label]?.toString() || "-",
  enableTooltip: true, 
  maxLength: 20, 
});

  });

  // Add static columns at the end
  columns.push(
    {
      header: "Submitted At",
      accessor: (response) =>
        new Date(response.createdAt).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
    },
    {
      header: "Status",
      accessor: (response) =>
        response.deletedAt
          ? `Deleted: ${new Date(response.deletedAt).toLocaleString()}`
          : "Active",
    }
  );

  return (
    <div className="space-y-4">
      <DataTable<FormResponse>
        columns={columns}
        data={paginatedResponses}
        isLoading={loading}
        isError={!!error}
        errorMessage={error || "Failed to load responses."}
        noDataMessage="No responses found."
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPreviousPage: handlePreviousPage,
                onNextPage: handleNextPage,
                totalItems: responses.length, // Pass total items for footer calculation
              }
            : undefined
        }
        renderRowActions={
          isAdmin
            ? (response) =>
                !response.deletedAt && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteResponse(response.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )
            : undefined
        }
      />
    </div>
  );
}