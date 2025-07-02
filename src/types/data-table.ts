// src/types/data-table.ts

import React from "react";

// Define a type for column configuration
export type DataTableColumn<T> = {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
  enableTooltip?: boolean; // New prop to control tooltip for this column
  maxLength?: number; // New prop for truncation length specific to a column
  // New: Add an optional 'id' for unique identification of columns, especially for toggling
  id?: string;
  // New: Add a 'searchable' property to indicate if a column's content can be searched
  searchable?: boolean;
  // New: Add a 'toggleable' property to indicate if a column's visibility can be toggled by the user
  toggleable?: boolean;
};

// Define props for the DataTable component
export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  noDataMessage?: string;
  renderRowActions?: (item: T) => React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
    totalItems?: number; // Made optional to align with DataTable usage
  };
  // New: Callback for when filters or search terms change.
  // This allows the parent component to react, e.g., for server-side filtering.
  onFilterChange?: (filters: { searchTerm: string; visibleColumns: string[] }) => void;
  // New: Initial search term to pre-fill the search input.
  initialSearchTerm?: string;
  // New: Initial visible columns by their 'id's.
  // If not provided, all toggleable columns will be visible by default.
  initialVisibleColumns?: string[];
}

// FormResponse type - crucial for your data structure
export interface FormResponse {
  id: string; // Changed to string for consistency with UUIDs
  userId: string;
  user?: {
    name: string;
    // Add other user properties if available
  };
  values: {
    [key: string]: any; // This allows for dynamic field names and values
  };
  createdAt: string;
  deletedAt?: string | null;
  // Add other properties that exist in your FormResponse data structure
}

// ExtendedResponsesTableProps for ResponsesTable component
export interface ExtendedResponsesTableProps {
  responses: FormResponse[];
  paginatedResponses: FormResponse[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  allFieldLabels: string[];
  isAdmin: boolean;
  isDeleting: boolean;
  handleDeleteResponse: (responseId: string) => void; // Changed to string
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleViewResponse: (responseId: string) => void;
  handleEditResponse: (responseId: string) => void;
  // New props to pass down to DataTable for filtering/visibility
  onFilterChange: (filters: { searchTerm: string; visibleColumns: string[] }) => void;
  initialSearchTerm: string;
  initialVisibleColumns: string[];
}