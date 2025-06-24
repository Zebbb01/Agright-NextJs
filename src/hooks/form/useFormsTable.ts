// src/hooks/useFormsTable.ts
import { useState, useEffect, useCallback } from "react";
import { Form } from "@/types/form"; // Use the Form type from shared types
import { fetchFormsService, deleteFormService } from "@/app/api/services/formService"; // Import service functions
import { toast } from "sonner"; // Import toast from sonner

const ITEMS_PER_PAGE = 10;

interface UseFormsTableReturn {
  forms: Form[];
  paginatedForms: Form[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleRefreshForms: () => void;
  handleDeleteForm: (formId: string, formName: string) => void; // Modified to open dialog
  MAX_DESCRIPTION_LENGTH: number;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  formToDelete: Form | null;
  isDeleting: boolean;
  handleDeleteConfirm: () => Promise<void>;
  // NEW: Add these to the return type so parent components can use them
  // These are not implemented in this hook, but signal that the parent will manage FormPanel visibility
  handleViewForm: (formId: string) => void; // Placeholder, parent will implement
  handleEditForm: (formId: string) => void; // Placeholder, parent will implement
  fetchForms: () => Promise<void>; // Expose the fetch function
}

export const useFormsTable = (): UseFormsTableReturn => {
  const [forms, setForms] = useState<Form[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for delete confirmation dialog and spinner
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Controls the spinner

  const MAX_DESCRIPTION_LENGTH = 50; // Constant for truncation

  const fetchForms = useCallback(async () => { // Renamed from fetchAllForms
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFormsService();
      // Assuming `data` is already sorted or you want to sort here
      const sortedData = data.sort(
        (a: Form, b: Form) =>
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
      );
      setForms(sortedData);
      setCurrentPage(1); // Reset to first page on new data fetch
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch forms:", err);
      toast.error("Failed to load forms", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms(); // Call the renamed fetch function
  }, [fetchForms]);

  // Function to open the delete confirmation dialog
  const handleDeleteForm = useCallback((formId: string, formName: string) => {
    setFormToDelete({ id: formId, name: formName, date: new Date(), details: "", deletedAt: null }); // Set minimal form data for dialog
    setDeleteDialogOpen(true); // Open the dialog
  }, []);

  // Function to confirm and execute the deletion
  const handleDeleteConfirm = useCallback(async () => {
    if (!formToDelete) return; // Should not happen if dialog is opened correctly

    setIsDeleting(true); // Activate spinner
    try {
      await deleteFormService(formToDelete.id); // Use the formToDelete's ID
      toast.success("Form deleted successfully", {
        description: `"${formToDelete.name}" has been removed.`,
      });
      await fetchForms(); // Re-fetch forms to update the table
      setDeleteDialogOpen(false); // Close the dialog
      setFormToDelete(null); // Clear the form to delete
    } catch (err: any) {
      console.error("Error deleting form:", err);
      toast.error("Failed to delete form", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false); // Deactivate spinner
    }
  }, [formToDelete, fetchForms]);

  const totalPages = Math.ceil(forms.length / ITEMS_PER_PAGE);
  const paginatedForms = forms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages]);

  const handleRefreshForms = useCallback(() => {
    fetchForms();
  }, [fetchForms]);

  // These are placeholder functions. The actual logic to open/close the FormPanel
  // and set its mode will reside in the parent component (FormPanelContainer).
  const handleViewForm = useCallback((formId: string) => {
    // This function will be called by FormTable, and its implementation
    // will be provided by FormPanelContainer to show the FormPanel in view mode.
    console.log("View form ID:", formId);
  }, []);

  const handleEditForm = useCallback((formId: string) => {
    // This function will be called by FormTable, and its implementation
    // will be provided by FormPanelContainer to show the FormPanel in edit mode.
    console.log("Edit form ID:", formId);
  }, []);


  return {
    forms,
    paginatedForms,
    currentPage,
    totalPages,
    loading,
    error,
    handlePreviousPage,
    handleNextPage,
    handleRefreshForms,
    handleDeleteForm,
    MAX_DESCRIPTION_LENGTH,
    // Export new states and functions
    deleteDialogOpen,
    setDeleteDialogOpen,
    formToDelete,
    isDeleting,
    handleDeleteConfirm,
    // NEWLY EXPORTED HANDLERS AND FETCH FUNCTION
    handleViewForm,
    handleEditForm,
    fetchForms, // Expose fetchForms for direct use by parent
  };
};
