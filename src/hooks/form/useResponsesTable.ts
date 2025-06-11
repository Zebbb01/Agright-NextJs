// src/hooks/useResponsesTable.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { FormResponse } from "@/types/form"; // Use the FormResponse type
import {
  fetchFormResponsesService,
  deleteFormResponseService,
  fetchFormResponseService, // Added to get a single response for potential viewing/editing flow
} from "@/app/api/services/formService"; // Import service functions

const ITEMS_PER_PAGE = 10;

interface UseResponsesTableProps {
  formId?: string; // Optional formId to fetch responses for a specific form
}

interface UseResponsesTableReturn {
  responses: FormResponse[];
  paginatedResponses: FormResponse[];
  currentPage: number;
  totalResponses: number; // Added totalResponses for better pagination control
  totalPages: number;
  loading: boolean; // For overall table loading
  isDeleting: boolean; // New: For individual delete action loading
  error: string | null;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleRefreshResponses: () => void;
  handleDeleteResponse: (responseId: number) => Promise<void>;
  allFieldLabels: string[];
}

export const useResponsesTable = ({
  formId,
}: UseResponsesTableProps): UseResponsesTableReturn => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // Overall table loading
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete loading
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFormResponsesService(formId);
      setResponses(data);
      setCurrentPage(1); // Reset to first page on new data fetch
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch responses:", err);
    } finally {
      setLoading(false);
    }
  }, [formId]); // Depend on formId so it refetches if formId changes

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const handleDeleteResponse = useCallback(async (responseId: number) => {
    setIsDeleting(true); // Start loading state for delete
    try {
      await deleteFormResponseService(responseId);
      await fetchResponses(); // Re-fetch responses to update the table
    } catch (err: any) {
      console.error("Error deleting response:", err);
      alert(`Error deleting response: ${err.message}`);
    } finally {
      setIsDeleting(false); // End loading state for delete
    }
  }, [fetchResponses]);

  const totalResponses = responses.length; // Calculate total responses
  const totalPages = Math.ceil(totalResponses / ITEMS_PER_PAGE);
  const paginatedResponses = responses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages]);

  const handleRefreshResponses = useCallback(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Dynamically determine all unique field labels from the 'values' objects
  // This will be used to generate table headers
  const allFieldLabels = useMemo(() => {
    const labels = new Set<string>();
    responses.forEach((res) => {
      Object.keys(res.values).forEach((key) => {
        // Exclude DbId fields from the visible columns
        if (!key.endsWith('DbId')) {
          labels.add(key);
        }
      });
    });
    return Array.from(labels).sort();
  }, [responses]); // Re-calculate when responses change

  return {
    responses,
    paginatedResponses,
    currentPage,
    totalResponses, // Return total responses
    totalPages,
    loading,
    isDeleting, // Return isDeleting state
    error,
    handlePreviousPage,
    handleNextPage,
    handleRefreshResponses,
    handleDeleteResponse,
    allFieldLabels,
  };
};