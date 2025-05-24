"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { useFormsTable } from "@/hooks/form/useFormsTable";
// No longer need TableRow, TableCell as DataTable handles it internally
import { Form } from "@/types/form"; // Using Form instead of FormData as per your Form definition

import { DataTable } from "../data-table";
import { DataTableColumn } from "@/types/data-table";

type FormTableProps = {
  setIsCreating: (isOpen: boolean) => void;
  isAdmin: boolean;
};

export default function FormTable({ isAdmin }: FormTableProps) {
  const {
    forms,
    paginatedForms,
    currentPage,
    totalPages,
    handlePreviousPage,
    handleNextPage,
    handleDeleteForm,
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    formToDelete,
    handleDeleteConfirm,
  } = useFormsTable();

  // Define columns for the FormTable
  const columns: DataTableColumn<Form>[] = [ // Changed FormData to Form
    { header: "Form Name", accessor: "name" },
    {
      header: "Details",
      accessor: "details",
      enableTooltip: true,
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
  ];

  return (
    <div className="space-y-4">
      <DataTable<Form> // Changed FormData to Form
        columns={columns}
        data={paginatedForms}
        isLoading={false} // Adjust based on your useFormsTable hook if it provides loading state
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
        renderRowActions={
          isAdmin
            ? (form) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteForm(form.id, form.name)}
                >
                  <Trash2 size={16} />
                </Button>
              )
            : undefined
        }
      />

      {/* Delete Dialog (this remains here as it's specific to form deletion logic) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}