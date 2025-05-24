// src/hooks/useResponsesTable.ts
import { useState, useEffect, useCallback } from "react";
import { FormResponse } from "@/types/form"; // Use the FormResponse type
import {
  fetchFormResponsesService,
  deleteFormResponseService,
} from "@/app/api/services/formService"; // Import service functions

const ITEMS_PER_PAGE = 10;

interface UseResponsesTableProps {
  formId?: string; // Optional formId to fetch responses for a specific form
}

interface UseResponsesTableReturn {
  responses: FormResponse[];
  paginatedResponses: FormResponse[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
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
    if (!window.confirm("Are you sure you want to delete this response?")) {
      return;
    }
    try {
      await deleteFormResponseService(responseId);
      fetchResponses(); // Re-fetch responses to update the table
    } catch (err: any) {
      console.error("Error deleting response:", err);
      alert(`Error deleting response: ${err.message}`);
    }
  }, [fetchResponses]);

  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);
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
  const allFieldLabels = Array.from(
    new Set(responses.flatMap((res) => Object.keys(res.values)))
  ).sort(); // Sort labels for consistent column order

  return {
    responses,
    paginatedResponses,
    currentPage,
    totalPages,
    loading,
    error,
    handlePreviousPage,
    handleNextPage,
    handleRefreshResponses,
    handleDeleteResponse,
    allFieldLabels,
  };
};