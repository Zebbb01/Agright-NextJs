// src/components/data/FormTable.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit } from "lucide-react";
import { Spinner } from "../ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFormsTable } from "@/hooks/form/useFormsTable"; // This import is fine, but the props are changed
import { Form } from "@/types/form";
import { DataTable } from "../data-table";
import { DataTableColumn } from "@/types/data-table";
import { DataTableControls } from "@/components/data-table-controls"; // Import the new component

// Define props for FormTable to receive filtered/paginated data and filter handlers
type FormTableProps = {
  isAdmin: boolean;
  paginatedForms: Form[]; // Now receives already paginated and filtered forms
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleViewForm: (formId: string) => void;
  handleEditForm: (formId: string) => void;
  handleDeleteForm: (formId: string, formName: string) => void;
  isDeleting: boolean;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  formToDelete: Form | null;
  handleDeleteConfirm: () => Promise<void>;
  // Props for external search and column visibility (NEW)
  onFilterChange: (filters: { searchTerm: string; visibleColumns: string[] }) => void;
  initialSearchTerm: string;
  initialVisibleColumns: string[];
};

export default function FormTable({
  isAdmin,
  paginatedForms,
  currentPage,
  totalPages,
  loading,
  error,
  handlePreviousPage,
  handleNextPage,
  handleViewForm,
  handleEditForm,
  handleDeleteForm,
  isDeleting,
  deleteDialogOpen,
  setDeleteDialogOpen,
  formToDelete,
  handleDeleteConfirm,
  onFilterChange, // Destructure new filter props
  initialSearchTerm,
  initialVisibleColumns,
}: FormTableProps) {
  // Define all possible columns for the FormTable
  const allColumns: DataTableColumn<Form>[] = useMemo(() => {
    return [
      {
        id: "formName", // Unique ID for toggling
        header: "Form Name",
        accessor: "name",
        searchable: true, // Make this column searchable
        toggleable: true, // Make this column toggleable
      },
      {
        id: "details", // Unique ID
        header: "Details",
        accessor: "details",
        enableTooltip: true,
        maxLength: 50,
        searchable: true,
        toggleable: true,
      },
      {
        id: "date", // Unique ID
        header: "Date",
        accessor: (form) =>
          form.date
            ? new Date(form.date).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "N/A",
        searchable: false, // Dates might not be easily searchable as free text
        toggleable: true,
      },
      {
        id: "status", // Unique ID
        header: "Status",
        accessor: (form) =>
          form.deletedAt ? `Deleted: ${new Date(form.deletedAt).toLocaleString()}` : "Active",
        searchable: true,
        toggleable: true,
      },
    ];
  }, []);

  // Filter columns based on initialVisibleColumns for DataTable rendering
  const displayedColumns = useMemo(() => {
    return allColumns.filter(
      (column) =>
        column.id === undefined || initialVisibleColumns.includes(column.id)
    );
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
      <DataTableControls<Form>
        searchTerm={initialSearchTerm}
        onSearchChange={handleSearchChange}
        columns={allColumns} // Pass all possible columns for the dropdown
        visibleColumnIds={initialVisibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <DataTable<Form>
        columns={displayedColumns} // Pass only the currently displayed columns to DataTable
        data={paginatedForms} // Pass the already paginated and filtered data
        isLoading={loading}
        isError={!!error}
        errorMessage={error || "Failed to load forms."}
        noDataMessage="No forms found."
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPreviousPage: handlePreviousPage,
                onNextPage: handleNextPage,
                totalItems: paginatedForms.length, // Total items on current page after pagination/filtering
              }
            : undefined
        }
        renderRowActions={(form) => (
          <div className="flex items-center space-x-2">
            {/* View Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewForm(form.id)}
              title="View Form"
              className="h-8"
            >
              <Eye size={16} />
            </Button>

            {/* Edit Button (only for admin and if not deleted) */}
            {isAdmin && !form.deletedAt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditForm(form.id)}
                title="Edit Form"
                className="h-8"
              >
                <Edit size={16} />
              </Button>
            )}

            {/* Permanent Delete Button (directly triggers the central AlertDialog) */}
            {isAdmin && !form.deletedAt && (
              <Button
                variant="destructive"
                size="sm"
                title="Delete Form Permanently"
                className="h-8"
                disabled={isDeleting}
                onClick={() => handleDeleteForm(form.id, form.name)}
              >
                {isDeleting ? <Spinner /> : <Trash2 size={16} />}
              </Button>
            )}
          </div>
        )}
      />

      {/* This AlertDialog is for the permanent delete confirmation. */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the form:{" "}
              <strong>{formToDelete?.name}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Spinner />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}