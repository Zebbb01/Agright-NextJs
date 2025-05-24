// Define a type for column configuration
export type DataTableColumn<T> = {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
  enableTooltip?: boolean; // New prop to control tooltip for this column
  maxLength?: number; // New prop for truncation length specific to a column
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
  renderFooter?: (data: T[]) => React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
    totalItems: number;
  };
}