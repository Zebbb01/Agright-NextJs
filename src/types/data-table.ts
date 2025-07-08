// src/types/data-table.ts
import React from "react";

export interface DataTableColumn<T> {
  id?: string; // Unique identifier for the column, used for visibility toggling
  header: string | React.ReactNode;
  accessor: keyof T | ((data: T) => React.ReactNode); // Can be a key or a function
  className?: string; // Tailwind CSS classes for styling
  enableTooltip?: boolean; // Whether to show a tooltip on hover for truncated text
  maxLength?: number; // Max length for text before truncation (if enableTooltip is true)
  searchable?: boolean; // Whether this column's data should be included in global search
  toggleable?: boolean; // Whether this column can be toggled on/off in the view dropdown
  searchAccessor?: (item: T) => string | number | boolean | null | undefined; // Custom accessor for search functionality
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  noDataMessage?: string;
  renderRowActions?: (row: T) => React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
    totalItems?: number;
  };
  // New props for enhanced functionality
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  visibleColumnIds?: string[];
  onColumnVisibilityChange?: (columnId: string, isChecked: boolean) => void;
  defaultVisibleColumns?: number; // Number of columns to show by default
  hideColumns?: string[]; // Column IDs to hide by default (like IDs, status)
}

export interface FormResponse {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: string;
  deletedAt?: string | null;
  values: {
    [key: string]: any;
  };
}

export interface ExtendedResponsesTableProps {
  responses: FormResponse[];
  allFieldLabels: string[];
  isAdmin: boolean;
  isDeleting: boolean;
  handleDeleteResponse: (responseId: string) => Promise<void>;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleViewResponse: (responseId: string) => void;
  handleEditResponse: (responseId: string) => void;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  visibleColumnIds: string[];
  onFilterChange: ({ searchTerm, visibleColumns }: { searchTerm: string; visibleColumns: string[] }) => void;
}

export interface UseResponsesTableProps {
  formId: string;
  currentPage: number;
  searchTerm: string;
  visibleColumnIds: string[];
}