// src/hooks/useResponsesTable.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { FormResponse } from "@/types/data-table"; // Use the FormResponse type from data-table.ts for consistency
import {
  fetchFormResponsesService,
  deleteFormResponseService,
} from "@/app/api/services/formService"; // Import service functions

const ITEMS_PER_PAGE = 10;

interface UseResponsesTableProps {
  formId?: string; // Optional formId to fetch responses for a specific form
  searchTerm: string; // New: Search term from the DataTable (passed from ResponseContainer)
  visibleColumnIds: string[]; // New: IDs of currently visible columns (passed from ResponseContainer)
  currentPage: number; // New: Current page (passed from ResponseContainer)
}

interface UseResponsesTableReturn {
  responses: FormResponse[]; // All responses fetched (before client-side pagination)
  paginatedResponses: FormResponse[]; // Responses after client-side search filtering and pagination
  // currentPage is now managed by ResponseContainer, so it's not returned here
  totalResponses: number; // Total responses after search filtering
  totalPages: number;
  loading: boolean; // For overall table loading
  isDeleting: boolean; // For individual delete action loading
  error: string | null;
  // Pagination handlers are now provided by ResponseContainer
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleRefreshResponses: () => void;
  handleDeleteResponse: (responseId: string) => Promise<void>;
  allFieldLabels: string[];
}

export const useResponsesTable = ({
  formId,
  searchTerm,
  visibleColumnIds, // This parameter is passed, but its primary use for data filtering is in DataTable
  currentPage, // Now correctly received from ResponseContainer
}: UseResponsesTableProps): UseResponsesTableReturn => {
  const [allFetchedResponses, setAllFetchedResponses] = useState<FormResponse[]>([]); // Stores all responses from the service
  // Removed internal currentPage state, as it's managed by ResponseContainer
  const [loading, setLoading] = useState(true); // Overall table loading
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all responses from the service
  const fetchResponses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming fetchFormResponsesService can fetch all responses for the formId
      // If your service supports server-side filtering, you would pass searchTerm here.
      // For now, we fetch all and filter client-side.
      const data = await fetchFormResponsesService(formId);
      // Convert id to string to match expected FormResponse type
      const normalizedData = data.map((item: any) => ({
        ...item,
        id: String(item.id),
      }));
      setAllFetchedResponses(normalizedData);
      // Removed setCurrentPage(1) here as ResponseContainer manages currentPage
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch responses:", err);
    } finally {
      setLoading(false);
    }
  }, [formId]); // Depend on formId so it refetches if formId changes

  // Effect to fetch responses when the component mounts or formId changes
  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Client-side filtering based on the searchTerm
  const filteredResponses = useMemo(() => {
    if (!searchTerm) {
      return allFetchedResponses;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allFetchedResponses.filter((response) => {
      // Check response ID
      if (response.id.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      // Check user name
      if (response.user?.name && response.user.name.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      // Check user ID - Convert to string before calling toLowerCase()
      if (String(response.userId).toLowerCase().includes(lowerCaseSearchTerm)) return true;
      // Check status
      if (response.deletedAt && "deleted".includes(lowerCaseSearchTerm)) return true;
      if (!response.deletedAt && "active".includes(lowerCaseSearchTerm)) return true;

      for (const key in response.values) {
        if (Object.prototype.hasOwnProperty.call(response.values, key)) {
          const value = response.values[key];
          if (Array.isArray(value)) {
            if (value.some(item => String(item).toLowerCase().includes(lowerCaseSearchTerm))) {
              return true;
            }
          } else if (value !== null && value !== undefined) {
            if (String(value).toLowerCase().includes(lowerCaseSearchTerm)) {
              return true;
            }
          }
        }
      }
      return false;
    });
  }, [allFetchedResponses, searchTerm]);

  // Handle deletion of a response
  const handleDeleteResponse = useCallback(async (responseId: string) => {
    setIsDeleting(true); // Start loading state for delete
    try {
      await deleteFormResponseService(Number(responseId));
      await fetchResponses(); // Re-fetch responses to update the table
    } catch (err: any) {
      console.error("Error deleting response:", err);
      // In a real app, use a custom modal or toast for user feedback
    } finally {
      setIsDeleting(false); // End loading state for delete
    }
  }, [fetchResponses]);

  // Calculate total responses after filtering
  const totalResponses = filteredResponses.length;
  const totalPages = Math.ceil(totalResponses / ITEMS_PER_PAGE);

  // Paginate the filtered responses using the currentPage from props
  const paginatedResponses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredResponses.slice(startIndex, endIndex);
  }, [filteredResponses, currentPage]);

  // Handle refreshing all responses
  const handleRefreshResponses = useCallback(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Dynamically determine all unique field labels from the 'values' objects
  const allFieldLabels = useMemo(() => {
    const labels = new Set<string>();
    allFetchedResponses.forEach((res) => {
      Object.keys(res.values).forEach((key) => {
        if (!key.endsWith('DbId')) {
          labels.add(key);
        }
      });
    });
    return Array.from(labels).sort();
  }, [allFetchedResponses]);

  return {
    responses: allFetchedResponses, // Return all fetched responses for DataTable's internal use
    paginatedResponses, // Return paginated and filtered responses for display
    // currentPage is now managed by ResponseContainer
    totalResponses, // Total after search filtering
    totalPages,
    loading,
    isDeleting,
    error,
    // Pagination handlers are now provided by ResponseContainer
    handlePreviousPage: () => {}, // Placeholder, as ResponseContainer provides this
    handleNextPage: () => {},     // Placeholder, as ResponseContainer provides this
    handleRefreshResponses,
    handleDeleteResponse,
    allFieldLabels,
  };
};