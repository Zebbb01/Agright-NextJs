// src/hooks/form/useArchive.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner"; // Ensure toast is imported from 'sonner'
import {
  getArchivedForms,
  getArchivedResponses,
  restoreForm,
  permanentDeleteForm,
  restoreResponse,
  permanentDeleteResponse,
} from "@/app/api/services/archiveService";
import { Form, FormResponse } from "@/types/form";

interface UseArchiveOptions {
  itemsPerPage?: number;
}

export function useArchive({ itemsPerPage = 10 }: UseArchiveOptions = {}) {
  const [archivedForms, setArchivedForms] = useState<Form[]>([]);
  const [archivedResponses, setArchivedResponses] = useState<FormResponse[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(true);

  // Pagination states for forms
  const [currentFormPage, setCurrentFormPage] = useState(1);
  const [totalFormPages, setTotalFormPages] = useState(1);

  // Pagination states for responses
  const [currentResponsePage, setCurrentResponsePage] = useState(1);
  const [totalResponsePages, setTotalResponsePages] = useState(1);

  const fetchForms = useCallback(async () => {
    setLoadingForms(true);
    try {
      const data = await getArchivedForms();
      setArchivedForms(data);
      setTotalFormPages(Math.ceil(data.length / itemsPerPage));
    } catch (error: any) {
      toast.error(`Failed to load archived forms: ${error.message}`); // Fix: Removed 'title' property
    } finally {
      setLoadingForms(false);
    }
  }, [itemsPerPage]);

  const fetchResponses = useCallback(async () => {
    setLoadingResponses(true);
    try {
      const data = await getArchivedResponses();
      setArchivedResponses(data);
      setTotalResponsePages(Math.ceil(data.length / itemsPerPage));
    } catch (error: any) {
      toast.error(`Failed to load archived responses: ${error.message}`); // Fix: Removed 'title' property
    } finally {
      setLoadingResponses(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchForms();
    fetchResponses();
  }, [fetchForms, fetchResponses]);

  // Pagination handlers for forms
  const handlePreviousFormPage = () => {
    setCurrentFormPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextFormPage = () => {
    setCurrentFormPage((prev) => Math.min(totalFormPages, prev + 1));
  };

  // Pagination handlers for responses
  const handlePreviousResponsePage = () => {
    setCurrentResponsePage((prev) => Math.max(1, prev - 1));
  };
  const handleNextResponsePage = () => {
    setCurrentResponsePage((prev) => Math.min(totalResponsePages, prev + 1));
  };

  const paginatedForms = archivedForms.slice(
    (currentFormPage - 1) * itemsPerPage,
    currentFormPage * itemsPerPage
  );

  const paginatedResponses = archivedResponses.slice(
    (currentResponsePage - 1) * itemsPerPage,
    currentResponsePage * itemsPerPage
  );

  const handleRestoreForm = useCallback(async (formId: string) => {
    try {
      await restoreForm(formId);
      toast.success("Form restored successfully."); // Fix: Removed 'title' property
      fetchForms(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error restoring form: ${error.message}`); // Fix: Removed 'title' property
    }
  }, [fetchForms]);

  const handlePermanentDeleteForm = useCallback(async (formId: string) => {
    try {
      await permanentDeleteForm(formId);
      toast.success("Form permanently deleted."); // Fix: Removed 'title' property
      fetchForms(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error deleting form permanently: ${error.message}`); // Fix: Removed 'title' property
    }
  }, [fetchForms]);

  const handleRestoreResponse = useCallback(async (responseId: number) => {
    try {
      await restoreResponse(responseId);
      toast.success("Response restored successfully."); // Fix: Removed 'title' property
      fetchResponses(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error restoring response: ${error.message}`); // Fix: Removed 'title' property
    }
  }, [fetchResponses]);

  const handlePermanentDeleteResponse = useCallback(async (responseId: number) => {
    try {
      await permanentDeleteResponse(responseId);
      toast.success("Response permanently deleted."); // Fix: Removed 'title' property
      fetchResponses(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error deleting response permanently: ${error.message}`); // Fix: Removed 'title' property
    }
  }, [fetchResponses]);

  return {
    paginatedForms,
    loadingForms,
    currentFormPage,
    totalFormPages,
    handlePreviousFormPage,
    handleNextFormPage,
    handleRestoreForm,
    handlePermanentDeleteForm,
    archivedFormsCount: archivedForms.length, // Provide total count for DataTables pagination
    paginatedResponses,
    loadingResponses,
    currentResponsePage,
    totalResponsePages,
    handlePreviousResponsePage,
    handleNextResponsePage,
    handleRestoreResponse,
    handlePermanentDeleteResponse,
    archivedResponsesCount: archivedResponses.length, // Provide total count for DataTables pagination
  };
}