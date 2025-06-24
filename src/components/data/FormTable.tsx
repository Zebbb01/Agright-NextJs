"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit } from "lucide-react"; // Import Eye and Edit icons
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
  // AlertDialogTrigger, // AlertDialogTrigger is no longer needed here as the button directly triggers the dialog
} from "@/components/ui/alert-dialog";
import { useFormsTable } from "@/hooks/form/useFormsTable";
import { Form } from "@/types/form";
import { DataTable } from "../data-table"; // Your existing DataTable
import { DataTableColumn } from "@/types/data-table"; // Import your custom column type

type FormTableProps = {
  setIsCreating: (isOpen: boolean) => void;
  isAdmin: boolean;
  // ADD THESE NEW PROPS:
  handleViewForm: (formId: string) => void;
  handleEditForm: (formId: string) => void;
};

export default function FormTable({
  isAdmin,
  handleViewForm, // Destructure new prop
  handleEditForm, // Destructure new prop
}: FormTableProps) {
  const {
    forms,
    paginatedForms,
    currentPage,
    totalPages,
    handlePreviousPage,
    handleNextPage,
    handleDeleteForm, // This now specifically handles opening the permanent delete dialog
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    formToDelete,
    handleDeleteConfirm,
  } = useFormsTable();

  // Define columns for the FormTable
  const columns: DataTableColumn<Form>[] = [
    { header: "Form Name", accessor: "name" },
    {
      header: "Details",
      accessor: "details",
      enableTooltip: true,
      maxLength: 50,
    },
    {
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
    },
    {
      header: "Status",
      accessor: (form) =>
        form.deletedAt ? `Deleted: ${new Date(form.deletedAt).toLocaleString()}` : "Active",
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<Form>
        columns={columns}
        data={paginatedForms}
        isLoading={false}
        noDataMessage="No forms found."
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPreviousPage: handlePreviousPage,
                onNextPage: handleNextPage,
                totalItems: forms.length,
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
                title="Delete Form Permanently" // Changed title for clarity
                className="h-8"
                disabled={isDeleting}
                onClick={() => handleDeleteForm(form.id, form.name)} // Directly call handleDeleteForm
              >
                {isDeleting ? <Spinner /> : <Trash2 size={16} />}
              </Button>
            )}
          </div>
        )}
      />

      {/* This AlertDialog is for the permanent delete confirmation. */}
      {/* It's now the *only* dialog for deletion initiated from the table row. */}
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
