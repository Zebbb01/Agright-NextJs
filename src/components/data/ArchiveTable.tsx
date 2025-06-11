// src/components/data/ArchiveTable.tsx
import React from "react";
import { format } from "date-fns";
import { History, Trash } from "lucide-react";

import { DataTable } from "@/components/data-table";
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

interface ArchiveTableProps<T> {
  data: T[];
  isLoading: boolean;
  type: "forms" | "responses";
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRestore: (id: T extends Form ? string : number) => void;
  onPermanentDelete: (id: T extends Form ? string : number) => void;
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
}: ArchiveTableProps<T>) {
  const getColumns = (): DataTableColumn<T>[] => {
    if (type === "forms") {
      return [
        {
          header: "Form Name",
          accessor: "name",
        },
        {
          header: "Details",
          accessor: "details",
          enableTooltip: true,
          maxLength: 50,
        },
        {
          header: "Deleted On",
          accessor: (item) =>
            (item as Form).deletedAt
              ? format(new Date((item as Form).deletedAt!), "PPP")
              : "N/A",
        },
        // IMPORTANT: Add an empty header for the actions column to align the header with the buttons
        {
          header: "", // Empty header for the actions column
          accessor: null, // No direct accessor for actions
        }
      ] as DataTableColumn<T>[];
    } else {
      return [
        {
          header: "Response ID",
          accessor: "id",
        },
        {
          header: "Form Name",
          accessor: (item) => (item as FormResponse).form?.name || "N/A",
        },
        {
          header: "Submitted By",
          accessor: (item) => (item as FormResponse).user?.name || "Anonymous",
        },
        {
          header: "Submitted On",
          accessor: (item) =>
            format(new Date((item as FormResponse).createdAt), "PPP"),
        },
        {
          header: "Deleted On",
          accessor: (item) =>
            (item as FormResponse).deletedAt
              ? format(new Date((item as FormResponse).deletedAt!), "PPP")
              : "N/A",
        },
        {
          header: "Response Data Summary",
          accessor: (item) => {
            const values = (item as FormResponse).values;
            const summary = Object.entries(values)
              .map(([key, val]) => `${key}: ${val}`)
              .slice(0, 2)
              .join(", ");
            return summary.length > 50
              ? summary.substring(0, 47) + "..."
              : summary;
          },
          enableTooltip: true,
          maxLength: 50,
        },
        // IMPORTANT: Add an empty header for the actions column to align the header with the buttons
        {
          header: "", // Empty header for the actions column
          accessor: null, // No direct accessor for actions
        }
      ] as DataTableColumn<T>[];
    }
  };

  const columns = getColumns();

  const renderRowActions = (item: T) => {
    const isForm = type === "forms";
    const itemId: string | number = isForm ? (item as Form).id : (item as FormResponse).id;
    const itemName = isForm
      ? (item as Form).name
      : `(ID: ${(item as FormResponse).id})`;

    return (
      // Added `justify-end` to align buttons to the right, and `items-center` for vertical alignment
      <div className="flex items-center justify-end gap-2 h-full">
        {type === "responses" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9"> {/* Explicit height if needed */}
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
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-9"> {/* Explicit height if needed */}
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
              <AlertDialogAction onClick={() => onRestore(itemId as T extends Form ? string : number)}>
                Restore
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="h-9"> {/* Explicit height if needed */}
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
              <AlertDialogAction onClick={() => onPermanentDelete(itemId as T extends Form ? string : number)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <DataTable<T>
      columns={columns}
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
        totalItems: totalItems,
      }}
      renderRowActions={renderRowActions}
    />
  );
}