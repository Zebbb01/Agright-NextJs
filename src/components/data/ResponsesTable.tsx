// src/components/data/ResponsesTable.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit } from "lucide-react";
import { ExtendedResponsesTableProps, FormResponse } from "@/types/data-table";
import { DataTable } from "../data-table";
import { DataTableColumn } from "@/types/data-table";
import { DataTableControls } from "@/components/data-table-controls"; // Import the new component

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "../ui/spinner";

export default function ResponsesTable({
  responses,
  currentPage,
  totalPages,
  loading,
  error,
  allFieldLabels,
  isAdmin,
  isDeleting,
  handleDeleteResponse,
  handlePreviousPage,
  handleNextPage,
  handleViewResponse,
  handleEditResponse,
  onFilterChange, // Keep this prop to receive updates from DataTableControls
  initialSearchTerm,
  initialVisibleColumns,
}: ExtendedResponsesTableProps) {
  // Dynamically define all possible columns
  const allColumns: DataTableColumn<FormResponse>[] = useMemo(() => {
    const baseColumns: DataTableColumn<FormResponse>[] = [
      {
        id: "responseId",
        header: "Response ID",
        accessor: "id",
        className: "font-medium",
        searchable: true,
        toggleable: false,
      },
      {
        id: "userName",
        header: "User",
        accessor: (response) => response.user?.name || `User ID: ${response.userId}`,
        searchable: true,
        toggleable: true,
      },
    ];

    const dynamicColumns: DataTableColumn<FormResponse>[] = allFieldLabels.map((label) => ({
      id: label,
      header: label,
      accessor: (response) => {
        const value = response.values[label];

        if (
          typeof value === "string" &&
          value.startsWith("https://res.cloudinary.com/") &&
          (value.includes("/image/upload/") ||
            value.includes("/form_uploads/"))
        ) {
          const transformedUrl = value.replace(
            "/upload/",
            "/upload/f_auto,q_auto/"
          );
          return (
            <img
              src={transformedUrl}
              alt={`Uploaded ${label}`}
              style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
              className="rounded-md"
            />
          );
        } else if (Array.isArray(value)) {
          return value.join(", ");
        } else if (value !== null && value !== undefined) {
          return value.toString();
        }
        return "-";
      },
      enableTooltip: true,
      maxLength: 20,
      searchable: true,
      toggleable: true,
    }));

    const staticColumns: DataTableColumn<FormResponse>[] = [
      {
        id: "submittedAt",
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
        searchable: false,
        toggleable: true,
      },
      {
        id: "status",
        header: "Status",
        accessor: (response) =>
          response.deletedAt
            ? `Deleted: ${new Date(response.deletedAt).toLocaleString()}`
            : "Active",
        searchable: true,
        toggleable: true,
      },
    ];

    return [...baseColumns, ...dynamicColumns, ...staticColumns];
  }, [allFieldLabels]);

  // Filter columns based on initialVisibleColumns
  const displayedColumns = useMemo(() => {
    // If initialVisibleColumns is provided, filter based on it.
    // Otherwise, assume all toggleable columns should be displayed initially.
    if (initialVisibleColumns && initialVisibleColumns.length > 0) {
      return allColumns.filter((column) =>
        column.id === undefined || initialVisibleColumns.includes(column.id)
      );
    }
    // Default to showing all toggleable columns
    return allColumns.filter((column) => column.toggleable !== false);
  }, [allColumns, initialVisibleColumns]);

  const handleSearchChange = (newSearchTerm: string) => {
    onFilterChange({ searchTerm: newSearchTerm, visibleColumns: initialVisibleColumns });
  };

  const handleColumnVisibilityChange = (columnId: string, isChecked: boolean) => {
    const newVisibleColumnIds = isChecked
      ? [...initialVisibleColumns, columnId]
      : initialVisibleColumns.filter((id) => id !== columnId);
    onFilterChange({ searchTerm: initialSearchTerm, visibleColumns: newVisibleColumnIds });
  };

  return (
    <div className="space-y-4">
      {/* Render the new DataTableControls component */}
      <DataTableControls<FormResponse>
        searchTerm={initialSearchTerm}
        onSearchChange={handleSearchChange}
        columns={allColumns} // Pass all possible columns for the dropdown
        visibleColumnIds={initialVisibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <DataTable<FormResponse>
        columns={displayedColumns} // Pass only the currently displayed columns to DataTable
        data={responses}
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
                totalItems: responses.length,
              }
            : undefined
        }
        renderRowActions={(response) => (
          <div className="flex items-center space-x-2">
            {/* View Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewResponse(response.id.toString())}
              title="View Response"
              className="h-8"
            >
              <Eye size={16} />
            </Button>

            {/* Edit Button (only for admin and if not deleted) */}
            {isAdmin && !response.deletedAt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditResponse(response.id.toString())}
                title="Edit Response"
                className="h-8"
              >
                <Edit size={16} />
              </Button>
            )}

            {/* Delete Button (with AlertDialog for confirmation) */}
            {isAdmin && !response.deletedAt && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    title="Delete Response"
                    className="h-8"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Spinner /> : <Trash2 size={16} />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will soft-delete this response and move it to the archive. You can restore it later from the archive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteResponse(response.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting && <Spinner />}
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      />
    </div>
  );
}