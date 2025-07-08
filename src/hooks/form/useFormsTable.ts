// src/hooks/form/useFormsTable.ts
import { useState, useEffect, useCallback, useMemo } from "react"; // Import useMemo
import { Form } from "@/types/form";
import { fetchFormsService, deleteFormService } from "@/services";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

interface UseFormsTableProps { // NEW: Props interface for the hook
  searchTerm: string;
  visibleColumnIds: string[]; // Passed, but primarily for column display in UI
  currentPage: number;
}

interface UseFormsTableReturn {
  forms: Form[]; // All forms fetched (before client-side pagination/filtering)
  paginatedForms: Form[]; // Forms after client-side search filtering and pagination
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleDeleteForm: (formId: string, formName: string) => void;
  MAX_DESCRIPTION_LENGTH: number;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  formToDelete: Form | null;
  isDeleting: boolean;
  handleDeleteConfirm: () => Promise<void>;
  fetchForms: () => Promise<void>; // Expose the fetch function
  allFieldLabels: string[]; // NEW: Expose allFieldLabels for dynamic column setup
}

export const useFormsTable = ({
  searchTerm,
  currentPage,
}: UseFormsTableProps): UseFormsTableReturn => { // Use props
  const [allFetchedForms, setAllFetchedForms] = useState<Form[]>([]); // Stores all forms from service
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const MAX_DESCRIPTION_LENGTH = 50;

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFormsService();
      const normalizedData = data.map((item: any) => ({
        ...item,
        id: String(item.id), // Ensure ID is string for consistency
      }));
      const sortedData = normalizedData.sort(
        (a: Form, b: Form) =>
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
      );
      setAllFetchedForms(sortedData);
      // Removed setCurrentPage(1) here as FormPanelContainer manages currentPage now
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
    fetchForms();
  }, [fetchForms]);

  // Client-side filtering based on the searchTerm (NEW)
  const filteredForms = useMemo(() => {
    if (!searchTerm) {
      return allFetchedForms;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allFetchedForms.filter((form) => {
      // Check form name
      if (form.name.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      // Check form details
      if (form.details?.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      // Check status
      if (form.deletedAt && "deleted".includes(lowerCaseSearchTerm)) return true;
      if (!form.deletedAt && "active".includes(lowerCaseSearchTerm)) return true;

      return false;
    });
  }, [allFetchedForms, searchTerm]);


  const handleDeleteForm = useCallback((formId: string, formName: string) => {
    setFormToDelete({ id: formId, name: formName, date: new Date(), details: "", deletedAt: null });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!formToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFormService(formToDelete.id);
      toast.success("Form deleted successfully", {
        description: `"${formToDelete.name}" has been removed.`,
      });
      await fetchForms();
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    } catch (err: any) {
      console.error("Error deleting form:", err);
      toast.error("Failed to delete form", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [formToDelete, fetchForms]);

  // Calculate total pages based on filteredForms (NEW)
  const totalPages = Math.ceil(filteredForms.length / ITEMS_PER_PAGE);

  // Paginate the filtered responses using the currentPage from props (NEW)
  const paginatedForms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredForms.slice(startIndex, endIndex);
  }, [filteredForms, currentPage]);

  // Pagination handlers (now internal to the hook, but FormPanelContainer provides the actual state change)
  const handlePreviousPage = useCallback(() => {
    // This is now a placeholder, actual state change happens in FormPanelContainer
  }, []);

  const handleNextPage = useCallback(() => {
    // This is now a placeholder, actual state change happens in FormPanelContainer
  }, []);

  // For FormTable, allFieldLabels will be static as there are no dynamic form fields in the Form object itself.
  const allFieldLabels = useMemo(() => ["Form Name", "Details", "Date", "Status"], []);

  return {
    forms: allFetchedForms, // Return all fetched forms
    paginatedForms,
    currentPage, // Return currentPage for display
    totalPages,
    loading,
    error,
    handlePreviousPage,
    handleNextPage,
    handleDeleteForm,
    MAX_DESCRIPTION_LENGTH,
    deleteDialogOpen,
    setDeleteDialogOpen,
    formToDelete,
    isDeleting,
    handleDeleteConfirm,
    fetchForms,
    allFieldLabels, // Expose allFieldLabels
  };
};