// src/hooks/form/useArchive.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getArchivedForms,
  getArchivedResponses,
  restoreForm,
  permanentDeleteForm,
  restoreResponse,
  permanentDeleteResponse,
} from "@/app/api/services/archiveService";
import { Form, FormResponse } from "@/types/form";
import { DataTableColumn } from "@/types/data-table"; // Import DataTableColumn if not already

interface UseArchiveProps {
  itemsPerPage?: number;
}

interface UseArchiveReturn {
  // Forms related
  paginatedForms: Form[];
  loadingForms: boolean;
  currentFormPage: number;
  totalFormPages: number;
  handlePreviousFormPage: () => void;
  handleNextFormPage: () => void;
  handleRestoreForm: (formId: string) => void;
  handlePermanentDeleteForm: (formId: string) => void;
  archivedFormsCount: number;
  allFormColumnLabels: DataTableColumn<Form>[]; // Expose for DataTableControls

  // Responses related
  paginatedResponses: FormResponse[];
  loadingResponses: boolean;
  currentResponsePage: number;
  totalResponsePages: number;
  handlePreviousResponsePage: () => void;
  handleNextResponsePage: () => void;
  handleRestoreResponse: (responseId: number) => void;
  handlePermanentDeleteResponse: (responseId: number) => void;
  archivedResponsesCount: number;
  allResponseColumnLabels: DataTableColumn<FormResponse>[]; // Expose for DataTableControls

  // Common handlers for search/filter in parent
  setFormSearchTerm: (term: string) => void;
  setResponseSearchTerm: (term: string) => void;
  setFormVisibleColumnIds: (ids: string[]) => void;
  setResponseVisibleColumnIds: (ids: string[]) => void;
  formSearchTerm: string; // Expose for initial value in DataTableControls
  responseSearchTerm: string; // Expose for initial value in DataTableControls
  formVisibleColumnIds: string[]; // Expose for initial value in DataTableControls
  responseVisibleColumnIds: string[]; // Expose for initial value in DataTableControls
}

export function useArchive({ itemsPerPage = 10 }: UseArchiveProps = {}): UseArchiveReturn {
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [allResponses, setAllResponses] = useState<FormResponse[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(true);

  // Search and Column Visibility states, managed internally by the hook
  const [formSearchTerm, setFormSearchTerm] = useState("");
  const [responseSearchTerm, setResponseSearchTerm] = useState("");
  const [formVisibleColumnIds, setFormVisibleColumnIds] = useState<string[]>([]);
  const [responseVisibleColumnIds, setResponseVisibleColumnIds] = useState<string[]>([]);

  // Pagination states for forms (now for filtered data)
  const [currentFormPage, setCurrentFormPage] = useState(1);

  // Pagination states for responses (now for filtered data)
  const [currentResponsePage, setCurrentResponsePage] = useState(1);

  const fetchForms = useCallback(async () => {
    setLoadingForms(true);
    try {
      const data = await getArchivedForms();
      // Ensure ID is string for consistency with FormsTable
      const normalizedData = data.map((item: any) => ({
        ...item,
        id: String(item.id),
      }));
      setAllForms(normalizedData);
      setCurrentFormPage(1); // Reset page on new data fetch
    } catch (error: any) {
      toast.error(`Failed to load archived forms: ${error.message}`);
    } finally {
      setLoadingForms(false);
    }
  }, []);

  const fetchResponses = useCallback(async () => {
    setLoadingResponses(true);
    try {
      const data = await getArchivedResponses();
      setAllResponses(data);
      setCurrentResponsePage(1); // Reset page on new data fetch
    } catch (error: any) {
      toast.error(`Failed to load archived responses: ${error.message}`);
    } finally {
      setLoadingResponses(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
    fetchResponses();
  }, [fetchForms, fetchResponses]);

  // --- Forms Logic ---
  const allFormColumns: DataTableColumn<Form>[] = useMemo(() => [
    {
      id: "name",
      header: "Form Name",
      accessor: "name",
      searchable: true,
      toggleable: true,
    },
    {
      id: "details",
      header: "Details",
      accessor: "details",
      enableTooltip: true,
      maxLength: 50,
      searchable: true,
      toggleable: true,
    },
    {
      id: "deletedAt",
      header: "Deleted On",
      accessor: (item) => (item.deletedAt ? new Date(item.deletedAt!).toLocaleDateString() : "N/A"),
      searchable: false, // Dates are harder to search as text
      toggleable: true,
    },
  ], []);

  // Filtered forms based on search term
  const filteredForms = useMemo(() => {
    if (!formSearchTerm) {
      return allForms;
    }
    const lowerCaseSearchTerm = formSearchTerm.toLowerCase();
    return allForms.filter((form) =>
      allFormColumns.some(col => {
        if (col.searchable && col.accessor) {
          const value = typeof col.accessor === 'function'
            ? col.accessor(form)
            : form[col.accessor as keyof Form]; // Assuming accessor is string key
          return String(value).toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      })
    );
  }, [allForms, formSearchTerm, allFormColumns]);


  const totalFormPages = Math.ceil(filteredForms.length / itemsPerPage);
  const paginatedForms = useMemo(() => {
    const startIndex = (currentFormPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredForms.slice(startIndex, endIndex);
  }, [filteredForms, currentFormPage, itemsPerPage]);

  const handlePreviousFormPage = () => {
    setCurrentFormPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextFormPage = () => {
    setCurrentFormPage((prev) => Math.min(totalFormPages, prev + 1));
  };

  const handleRestoreForm = useCallback(async (formId: string) => {
    try {
      await restoreForm(formId);
      toast.success("Form restored successfully.");
      fetchForms(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error restoring form: ${error.message}`);
    }
  }, [fetchForms]);

  const handlePermanentDeleteForm = useCallback(async (formId: string) => {
    try {
      await permanentDeleteForm(formId);
      toast.success("Form permanently deleted.");
      fetchForms(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error deleting form permanently: ${error.message}`);
    }
  }, [fetchForms]);

  // --- Responses Logic ---
  const allResponseColumns: DataTableColumn<FormResponse>[] = useMemo(() => [
    {
      id: "responseId",
      header: "Response ID",
      accessor: "id",
      searchable: true,
      toggleable: true,
    },
    {
      id: "formName",
      header: "Form Name",
      accessor: (item) => item.form?.name || "N/A",
      searchable: true,
      toggleable: true,
    },
    {
      id: "submittedBy",
      header: "Submitted By",
      accessor: (item) => item.user?.name || "Anonymous",
      searchable: true,
      toggleable: true,
    },
    {
      id: "submittedOn",
      header: "Submitted On",
      accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
      searchable: false, // Dates are harder to search as text
      toggleable: true,
    },
    {
      id: "deletedOnResponse", // Unique ID
      header: "Deleted On",
      accessor: (item) => (item.deletedAt ? new Date(item.deletedAt!).toLocaleDateString() : "N/A"),
      searchable: false,
      toggleable: true,
    },
    {
      id: "responseDataSummary",
      header: "Response Data Summary",
      accessor: (item) => {
        const values = item.values;
        const summary = Object.entries(values)
          .map(([key, val]) => `${key}: ${val}`)
          .slice(0, 2)
          .join(", ");
        return summary.length > 50 ? summary.substring(0, 47) + "..." : summary;
      },
      enableTooltip: true,
      maxLength: 50,
      searchable: true,
      toggleable: true,
    },
  ], []);

  // Filtered responses based on search term
  const filteredResponses = useMemo(() => {
    if (!responseSearchTerm) {
      return allResponses;
    }
    const lowerCaseSearchTerm = responseSearchTerm.toLowerCase();
    return allResponses.filter((response) =>
      allResponseColumns.some(col => {
        if (col.searchable && col.accessor) {
          const value = typeof col.accessor === 'function'
            ? col.accessor(response)
            : response[col.accessor as keyof FormResponse]; // Assuming accessor is string key
          return String(value).toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      })
    );
  }, [allResponses, responseSearchTerm, allResponseColumns]);

  const totalResponsePages = Math.ceil(filteredResponses.length / itemsPerPage);
  const paginatedResponses = useMemo(() => {
    const startIndex = (currentResponsePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResponses.slice(startIndex, endIndex);
  }, [filteredResponses, currentResponsePage, itemsPerPage]);

  const handlePreviousResponsePage = () => {
    setCurrentResponsePage((prev) => Math.max(1, prev - 1));
  };
  const handleNextResponsePage = () => {
    setCurrentResponsePage((prev) => Math.min(totalResponsePages, prev + 1));
  };

  const handleRestoreResponse = useCallback(async (responseId: number) => {
    try {
      await restoreResponse(responseId);
      toast.success("Response restored successfully.");
      fetchResponses(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error restoring response: ${error.message}`);
    }
  }, [fetchResponses]);

  const handlePermanentDeleteResponse = useCallback(async (responseId: number) => {
    try {
      await permanentDeleteResponse(responseId);
      toast.success("Response permanently deleted.");
      fetchResponses(); // Refresh the list
    } catch (error: any) {
      toast.error(`Error deleting response permanently: ${error.message}`);
    }
  }, [fetchResponses]);

  // Set initial visible columns once data is loaded and columns are available
  useEffect(() => {
    if (allFormColumns.length > 0 && formVisibleColumnIds.length === 0) {
      setFormVisibleColumnIds(allFormColumns.filter(col => col.toggleable).map(col => col.id!));
    }
    if (allResponseColumns.length > 0 && responseVisibleColumnIds.length === 0) {
      setResponseVisibleColumnIds(allResponseColumns.filter(col => col.toggleable).map(col => col.id!));
    }
  }, [allFormColumns, formVisibleColumnIds, allResponseColumns, responseVisibleColumnIds]);

  return {
    paginatedForms,
    loadingForms,
    currentFormPage,
    totalFormPages,
    handlePreviousFormPage,
    handleNextFormPage,
    handleRestoreForm,
    handlePermanentDeleteForm,
    archivedFormsCount: filteredForms.length, // Count of filtered forms
    allFormColumnLabels: allFormColumns,

    paginatedResponses,
    loadingResponses,
    currentResponsePage,
    totalResponsePages,
    handlePreviousResponsePage,
    handleNextResponsePage,
    handleRestoreResponse,
    handlePermanentDeleteResponse,
    archivedResponsesCount: filteredResponses.length, // Count of filtered responses
    allResponseColumnLabels: allResponseColumns,

    setFormSearchTerm,
    setResponseSearchTerm,
    setFormVisibleColumnIds,
    setResponseVisibleColumnIds,
    formSearchTerm,
    responseSearchTerm,
    formVisibleColumnIds,
    responseVisibleColumnIds,
  };
}