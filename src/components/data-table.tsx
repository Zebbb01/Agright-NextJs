// src/components/data-table.tsx
"use client";

import { useMemo } from "react"; // Only useMemo is needed internally now for filteredData and displayedColumns
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
import { DataTableProps } from "@/types/data-table"; // Ensure DataTableProps is imported

const DEFAULT_MAX_LENGTH = 50;

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
  pagination,
  // Removed onFilterChange, initialSearchTerm, initialVisibleColumns props
}: DataTableProps<T>) {
  // filteredData is now simply `data` as filtering is done upstream in the hook/container
  // The `data` prop passed to DataTable is assumed to be already filtered and paginated.
  // The `useMemo` for filteredData is no longer needed here for actual filtering logic.
  // We'll keep it for clarity that `data` represents the filtered set.
  const filteredData = useMemo(() => data, [data]);

  // displayedColumns will now depend on the `columns` prop, which will already be filtered for visibility
  // in the parent component (ResponsesTable/ResponseContainer).
  // So, no internal visibleColumns state or filtering by visibleColumnIds in DataTable.
  const displayedColumns = useMemo(() => columns, [columns]);

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

  // Calculate colSpan for the footer.
  const colSpanForFooter = displayedColumns.length + (renderRowActions ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Removed Search Input and Column Visibility Toggle from here */}

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              {displayedColumns.map((column, index) => (
                <TableHead key={column.id || index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {renderRowActions && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {displayedColumns.map((column, colIndex) => (
                  <TableCell key={column.id || colIndex} className={column.className}>
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
                  <TableCell className="flex items-center justify-center h-full">
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
                Total:{" "}
                {pagination?.totalItems !== undefined
                  ? pagination.totalItems
                  : filteredData.length}{" "}
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