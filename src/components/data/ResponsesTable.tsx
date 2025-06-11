// src/components/data/ResponsesTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit } from "lucide-react"; // Import Eye and Edit icons
import { ExtendedResponsesTableProps, FormResponse } from "@/types/form";
import { DataTable } from "../data-table"; // Your existing DataTable
import { DataTableColumn } from "@/types/data-table"; // Import your custom column type

// Import AlertDialog components
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
} from "@/components/ui/alert-dialog"; // Make sure the path is correct
import { Spinner } from "../ui/spinner";

export default function ResponsesTable({
  responses,
  paginatedResponses,
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
}: ExtendedResponsesTableProps) {
  // Dynamically define columns for the DataTable
  const columns: DataTableColumn<FormResponse>[] = [
    { header: "Response ID", accessor: "id", className: "font-medium" },
    {
      header: "User",
      accessor: (response) => response.user?.name || `User ID: ${response.userId}`,
    },
  ];

  // Add dynamic columns for each field label
  allFieldLabels.forEach((label) => {
    columns.push({
      header: label,
      accessor: (response) => {
        const value = response.values[label];

        // Check if the value looks like a Cloudinary image URL
        if (
          typeof value === "string" &&
          value.startsWith("https://res.cloudinary.com/") &&
          (value.includes("/image/upload/") || value.includes("/form_uploads/"))
        ) {
          // Construct the Cloudinary URL with auto format and auto quality transformations
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
              className="h-8" // Added for consistent height
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
                className="h-8" // Added for consistent height
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
                    // Disable the button when a deletion is in progress
                    disabled={isDeleting}
                  >
                    {/* Show spinner or icon based on isDeleting state */}
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
                    {/* Disable Cancel button during deletion */}
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteResponse(response.id)}
                      // Disable the action button during deletion
                      disabled={isDeleting}
                    >
                      {/* Show spinner inside the action button */}
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