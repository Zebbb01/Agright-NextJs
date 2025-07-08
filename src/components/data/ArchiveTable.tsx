// src/components/data/ArchiveTable.tsx
import React, { useMemo } from "react"; // Import useMemo
import { format } from "date-fns";
import { History, Trash } from "lucide-react";

import { DataTable } from "@/components/table/data-table";
import { DataTableColumn } from "@/types/data-table";
import { Form, FormResponse } from "@/types/form";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogSuccess,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTableControls } from "@/components/table/data-table-controls"; // Import DataTableControls

interface ArchiveTableProps<T> {
  data: T[];
  isLoading: boolean;
  type: "forms" | "responses";
  currentPage: number;
  totalPages: number;
  totalItems: number; // This is the total AFTER filtering
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRestore: (id: T extends Form ? string : number) => void;
  onPermanentDelete: (id: T extends Form ? string : number) => void;
  // NEW PROPS FOR FILTERING
  allColumns: DataTableColumn<T>[]; // All possible columns for this table type
  searchTerm: string;
  visibleColumnIds: string[];
  onFilterChange: (filters: { searchTerm: string; visibleColumns: string[] }) => void;
}

export function ArchiveTable<T extends Form | FormResponse>({
  data,
  isLoading,
  type,
  currentPage,
  totalPages,
  totalItems,
  onPreviousPage,
  onNextPage,
  onRestore,
  onPermanentDelete,
  allColumns, // NEW
  searchTerm, // NEW
  visibleColumnIds, // NEW
  onFilterChange, // NEW
}: ArchiveTableProps<T>) {

  // Filter columns based on visibleColumnIds for DataTable rendering
  const displayedColumns = useMemo(() => {
    return allColumns.filter(
      (column) =>
        // Always include columns without an 'id' (like the actions column)
        column.id === undefined || visibleColumnIds.includes(column.id)
    );
  }, [allColumns, visibleColumnIds]);

  const handleSearchChange = (newSearchTerm: string) => {
    onFilterChange({ searchTerm: newSearchTerm, visibleColumns: visibleColumnIds });
  };

  const handleColumnVisibilityChange = (columnId: string, isChecked: boolean) => {
    const newVisibleColumnIds = isChecked
      ? [...visibleColumnIds, columnId]
      : visibleColumnIds.filter((id) => id !== columnId);
    onFilterChange({ searchTerm: searchTerm, visibleColumns: newVisibleColumnIds });
  };

  const renderRowActions = (item: T) => {
    const isForm = type === "forms";
    const itemId: string | number = isForm ? (item as Form).id : (item as FormResponse).id;
    const itemName = isForm
      ? (item as Form).name
      : `(ID: ${(item as FormResponse).id})`;

    return (
      <div className="flex items-center justify-end gap-2 h-full">
        {/* {type === "responses" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                View Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Response Data (ID: {(item as FormResponse).id})</DialogTitle>
              </DialogHeader>
              <pre className="mt-4 p-4 bg-gray-100 rounded-md text-sm break-words whitespace-pre-wrap">
                {JSON.stringify((item as FormResponse).values, null, 2)}
              </pre>
            </DialogContent>
          </Dialog>
        )} */}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <History className="mr-2 h-4 w-4" /> Restore
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will restore the {isForm ? "form" : "response"}{" "}
                &quot;{itemName}&quot; from the archive. It will become visible
                in your active {isForm ? "forms" : "responses"} again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogSuccess onClick={() => onRestore(itemId as any)}>
                Restore
              </AlertDialogSuccess>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="h-9">
              <Trash className="mr-2 h-4 w-4" /> Delete Permanently
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you absolutely sure you want to permanently delete this{" "}
                {isForm ? "form" : "response"}?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {isForm ? "form" : "response"} &quot;{itemName}&quot;
              {isForm && " and all its associated responses"}.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onPermanentDelete(itemId as any)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DataTableControls<T>
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        columns={allColumns} // Pass all possible columns to controls
        visibleColumnIds={visibleColumnIds}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />
      <DataTable<T>
        columns={[
          ...displayedColumns,
          // Add a dummy column for actions if not already present and needed for alignment
          { header: "", id: "actions", accessor: () => null }
        ]}
        data={data}
        isLoading={isLoading}
        isError={false}
        errorMessage={`Failed to load archived ${type}.`}
        noDataMessage={`No archived ${type} found.`}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          onPreviousPage: onPreviousPage,
          onNextPage: onNextPage,
          totalItems: totalItems, // This is the filtered total
        }}
        renderRowActions={renderRowActions}
      />
    </div>
  );
}