// src/hooks/form/useFormDeletion.ts
import { useState, useCallback } from "react";
import { permanentlyDeleteFormResponseService } from "@/services";

interface UseFormDeletionReturn {
  deletingResponse: boolean;
  errorDeletingResponse: string | null;
  handlePermanentDeleteResponse: (responseId: number) => Promise<boolean>;
}

/**
 * useFormDeletion Hook
 *
 * Manages the permanent deletion of a form response.
 * Provides states for deletion loading and errors.
 *
 * @returns {UseFormDeletionReturn} An object containing deletion states,
 * errors, and the permanent deletion handler.
 */
export const useFormDeletion = (): UseFormDeletionReturn => {
  const [deletingResponse, setDeletingResponse] = useState(false);
  const [errorDeletingResponse, setErrorDeletingResponse] = useState<string | null>(null);

  const handlePermanentDeleteResponse = useCallback(async (responseId: number): Promise<boolean> => {
    setDeletingResponse(true);
    setErrorDeletingResponse(null);
    try {
      await permanentlyDeleteFormResponseService(responseId);
      console.log(`Response ${responseId} and associated data permanently deleted successfully.`);
      return true;
    } catch (error: any) {
      console.error(`Error permanently deleting response ${responseId}:`, error);
      setErrorDeletingResponse(error.message || "Failed to permanently delete response.");
      return false;
    } finally {
      setDeletingResponse(false);
    }
  }, []);

  return {
    deletingResponse,
    errorDeletingResponse,
    handlePermanentDeleteResponse,
  };
};
