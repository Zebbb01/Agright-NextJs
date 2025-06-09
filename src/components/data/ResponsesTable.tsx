// src/components/data/ResponsesTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit } from "lucide-react"; // Import Eye and Edit icons
import { ExtendedResponsesTableProps, FormResponse } from "@/types/form";
import { DataTable } from "../data-table";
import { DataTableColumn } from "../../types/data-table";

// You'll likely need to import the Image component from 'next/image' if you're using it
// import Image from 'next/image'; // Uncomment if you use next/image

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
  handleViewResponse, // ADD THIS: New prop for viewing a response
  handleEditResponse, // ADD THIS: New prop for editing a response
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
      accessor: (response) => {
        const value = response.values[label];

        // Check if the value looks like a Cloudinary image URL
        // You might need a more robust check based on your Cloudinary URL structure
        if (
          typeof value === "string" &&
          value.startsWith("https://res.cloudinary.com/") &&
          (value.includes("/image/upload/") || value.includes("/form_uploads/"))
        ) {
          // Construct the Cloudinary URL with auto format and auto quality transformations
          // Insert 'f_auto,q_auto' right after '/upload/'
          const transformedUrl = value.replace(
            "/upload/",
            "/upload/f_auto,q_auto/"
          );

          return (
            <img
              src={transformedUrl} // Use the transformed URL here
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
              onClick={() => handleViewResponse(response.id.toString())} // Call new view handler
              title="View Response"
            >
              <Eye size={16} />
            </Button>

            {/* Edit Button (only for admin and if not deleted) */}
            {isAdmin && !response.deletedAt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditResponse(response.id.toString())} // Call new edit handler
                title="Edit Response"
              >
                <Edit size={16} />
              </Button>
            )}

            {/* Delete Button (existing) */}
            {isAdmin && !response.deletedAt && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteResponse(response.id)}
                title="Delete Response"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
}