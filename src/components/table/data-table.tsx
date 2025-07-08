// src/components/table/data-table.tsx
"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Spinner } from "../ui/spinner";
import { DataTableProps, DataTableColumn } from "@/types/data-table";
import { DataTableControls } from "./data-table-controls";

const DEFAULT_MAX_LENGTH = 50;

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

// Helper function to get searchable text from a data item
function getSearchableText<T>(item: T, column: DataTableColumn<T>): string {
  if (!column.searchable) return "";
  
  let value: any;
  
  if (column.searchAccessor) {
    value = column.searchAccessor(item);
  } else if (typeof column.accessor === "function") {
    // For functions that return React nodes, we can't search them effectively
    // Unless they also provide a searchAccessor
    return "";
  } else {
    value = item[column.accessor];
  }
  
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(" ");
  return String(value).toLowerCase();
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = "An error occurred while loading data.",
  noDataMessage = "No data available.",
  renderRowActions,
  pagination,
  // New props for search and column management
  searchTerm = "",
  onSearchChange,
  visibleColumnIds,
  onColumnVisibilityChange,
  defaultVisibleColumns = 7,
  hideColumns = [], // Columns to hide by default (like IDs, status)
}: DataTableProps<T>) {
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) => {
      return columns.some((column) => {
        const searchableText = getSearchableText(item, column);
        return searchableText.includes(searchLower);
      });
    });
  }, [data, searchTerm, columns]);

  // Determine initial visible columns if not provided
  const initialVisibleColumns = useMemo(() => {
    if (visibleColumnIds && visibleColumnIds.length > 0) {
      return visibleColumnIds;
    }
    
    // Auto-select first N toggleable columns, excluding hidden ones
    const toggleableColumns = columns.filter(col => 
      col.toggleable !== false && 
      col.id && 
      !hideColumns.includes(col.id)
    );
    
    return toggleableColumns
      .slice(0, defaultVisibleColumns)
      .map(col => col.id!)
      .filter(Boolean);
  }, [columns, visibleColumnIds, defaultVisibleColumns, hideColumns]);

  // Filter displayed columns based on visibility settings
  const displayedColumns = useMemo(() => {
    const visibleIds = visibleColumnIds || initialVisibleColumns;
    return columns.filter((column) => {
      // Always show non-toggleable columns
      if (column.toggleable === false) return true;
      // Show if column has no ID (shouldn't happen but fallback)
      if (!column.id) return true;
      // Show if column is in visible list
      return visibleIds.includes(column.id);
    });
  }, [columns, visibleColumnIds, initialVisibleColumns]);

  const handleSearchChange = (newSearchTerm: string) => {
    onSearchChange?.(newSearchTerm);
  };

  const handleColumnVisibilityChange = (columnId: string, isChecked: boolean) => {
    onColumnVisibilityChange?.(columnId, isChecked);
  };

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

  const colSpanForFooter = displayedColumns.length + (renderRowActions ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Show controls if search or column management is enabled */}
      {(onSearchChange || onColumnVisibilityChange) && (
        <DataTableControls<T>
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          columns={columns}
          visibleColumnIds={visibleColumnIds || initialVisibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      )}

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
                {searchTerm && filteredData.length !== data.length && (
                  <span className="text-sm">
                    (filtered from {data.length})
                  </span>
                )}
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