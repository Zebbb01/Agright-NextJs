// src/components/data/FormTable.tsx
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
import { Form } from "@/types/form";
import { DataTable } from "../data-table"; // Your existing DataTable
import { DataTableColumn } from "@/types/data-table"; // Import your custom column type

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