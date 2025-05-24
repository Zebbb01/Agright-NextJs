// src/components/data-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Spinner } from "./ui/spinner";
import { DataTableProps, DataTableColumn } from "@/types/data-table"; // Ensure DataTableProps and DataTableColumn are imported from here

const DEFAULT_MAX_LENGTH = 20;

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = "An error occurred while loading data.",
  noDataMessage = "No data available.",
  renderRowActions,
  pagination, // renderFooter prop will be removed from DataTableProps
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 space-y-2">
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 space-y-2">
        <p>{noDataMessage}</p>
      </div>
    );
  }

  // Calculate colSpan for the footer. It's the number of columns,
  // plus 1 if there's an actions column.
  const colSpanForFooter = columns.length + (renderRowActions ? 1 : 0);

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {renderRowActions && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {(() => {
                      const value =
                        typeof column.accessor === "function"
                          ? column.accessor(item)
                          : (item[column.accessor] as string);

                      if (
                        column.enableTooltip &&
                        typeof value === "string" &&
                        value.length > (column.maxLength ?? DEFAULT_MAX_LENGTH)
                      ) {
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                {truncateText(
                                  value,
                                  column.maxLength ?? DEFAULT_MAX_LENGTH
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{value}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return value;
                    })()}
                  </TableCell>
                ))}
                {renderRowActions && (
                  <TableCell className="text-right">
                    {renderRowActions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={colSpanForFooter}
                className="text-muted-foreground"
              >
                {/* Use pagination.totalItems if available, otherwise fallback to data.length */}
                Total:{" "}
                {pagination?.totalItems !== undefined
                  ? pagination.totalItems
                  : data.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TooltipProvider>

      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={pagination.onPreviousPage}
                className={
                  pagination.currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={pagination.onNextPage}
                className={
                  pagination.currentPage === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
