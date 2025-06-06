// src/components/data/ResponsesTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
        if (typeof value === 'string' && value.startsWith('https://res.cloudinary.com/') && (value.includes('/image/upload/') || value.includes('/form_uploads/'))) {
          // Render an img tag for image URLs
          return (
            // Using a regular <img> tag, make sure to set width/height or max-width/max-height via CSS
            // If using Next.js Image component, replace <img> with <Image> and add width/height props
            <img
              src={value}
              alt={`Uploaded ${label}`}
              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} // Basic styling for display
              className="rounded-md" // Add any Tailwind classes if needed
            />
            // If you want to use Next.js <Image /> component, it would look like this:
            // <Image
            //   src={value}
            //   alt={`Uploaded ${label}`}
            //   width={100} // Set appropriate width
            //   height={100} // Set appropriate height
            //   objectFit="contain" // Or "cover" depending on your design
            //   className="rounded-md"
            // />
          );
        } else if (Array.isArray(value)) {
          return value.join(", ");
        } else if (value !== null && value !== undefined) {
          return value.toString();
        }
        return "-";
      },
      enableTooltip: true,
      maxLength: 20, // This maxLength might not be ideal for image cells, consider its impact
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