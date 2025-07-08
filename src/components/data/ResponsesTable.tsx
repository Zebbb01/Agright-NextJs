// src/components/data/ResponsesTable.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit } from "lucide-react";
import { ExtendedResponsesTableProps, FormResponse } from "@/types/data-table";
import { DataTable } from "../table/data-table";
import { DataTableColumn } from "@/types/data-table";

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
  onFilterChange,
  searchTerm,
  visibleColumnIds,
}: ExtendedResponsesTableProps) {
  
  // Define all possible columns with proper search accessors
  const allColumns: DataTableColumn<FormResponse>[] = useMemo(() => {
    const baseColumns: DataTableColumn<FormResponse>[] = [
      {
        id: "responseId",
        header: "Response ID",
        accessor: "id",
        className: "font-medium",
        searchable: true,
        toggleable: true, // Made toggleable so it can be hidden
        searchAccessor: (response) => response.id,
      },
      {
        id: "userName",
        header: "User",
        accessor: (response) => response.user?.name || `User ID: ${response.userId}`,
        searchable: true,
        toggleable: true,
        searchAccessor: (response) => response.user?.name || response.userId,
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
      searchAccessor: (response) => {
        const value = response.values[label];
        if (Array.isArray(value)) {
          return value.join(" ");
        } else if (value !== null && value !== undefined) {
          return value.toString();
        }
        return "";
      },
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
        searchable: true,
        toggleable: true,
        searchAccessor: (response) => 
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
        id: "status",
        header: "Status",
        accessor: (response) =>
          response.deletedAt
            ? `Deleted: ${new Date(response.deletedAt).toLocaleString()}`
            : "Active",
        searchable: true,
        toggleable: true, // Made toggleable so it can be hidden
        searchAccessor: (response) =>
          response.deletedAt ? "deleted" : "active",
      },
    ];

    return [...baseColumns, ...dynamicColumns, ...staticColumns];
  }, [allFieldLabels]);

  const handleSearchChange = (newSearchTerm: string) => {
    onFilterChange({ searchTerm: newSearchTerm, visibleColumns: visibleColumnIds });
  };

  const handleColumnVisibilityChange = (columnId: string, isChecked: boolean) => {
    const newVisibleColumnIds = isChecked
      ? [...visibleColumnIds, columnId]
      : visibleColumnIds.filter((id) => id !== columnId);
    onFilterChange({ searchTerm: searchTerm, visibleColumns: newVisibleColumnIds });
  };

  return (
    <div className="space-y-4">
      <DataTable<FormResponse>
        columns={allColumns}
        data={responses}
        isLoading={loading}
        isError={!!error}
        errorMessage={error || "Failed to load responses."}
        noDataMessage="No responses found."
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        visibleColumnIds={visibleColumnIds}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        defaultVisibleColumns={7} // Show 7 columns by default
        hideColumns={["responseId", "status"]} // Hide ID and status by default
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
                      This action will delete this response and move it to the archive. You can restore it later from the archive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteResponse(response.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting && <Spinner />}
                      Delete
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