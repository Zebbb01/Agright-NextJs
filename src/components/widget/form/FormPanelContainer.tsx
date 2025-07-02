// src/components/widget/form/FormPanelContainer.tsx
"use client";

import { useState, useCallback, useEffect } from "react"; // Import useEffect
import FormPanel from "./FormPanel";
import FormTable from "../../data/FormTable";
import { Button } from "../../ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { Spinner } from "../../ui/spinner";
import { useFormManagement } from "@/hooks/form/useFormManagement";
import { useFormsTable } from "@/hooks/form/useFormsTable";

interface Props {
  formId?: string; // Make formId optional as this container might manage creating forms without a specific ID
}

export default function FormPanelContainer({ formId }: Props) {
  // States for managing FormPanel visibility and mode
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [formIdToEdit, setFormIdToEdit] = useState<string | null>(null);
  const [isFormPanelReadOnly, setIsFormPanelReadOnly] = useState(false);

  // States for search and visible columns (NEW)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Manage currentPage here

  const {
    loadingForm,
    errorFetchingForm,
    user,
    isLoadingAuth,
    isAdmin,
    refetchForm,
  } = useFormManagement({ formId });

  const {
    forms, // All forms (before client-side pagination/filtering in hook)
    paginatedForms, // Forms after client-side search filtering and pagination
    totalPages, // Get totalPages from the hook
    loading,
    error,
    handleDeleteForm, // Keep for confirmation dialog logic
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    formToDelete,
    handleDeleteConfirm,
    allFieldLabels, // NEW: Get allFieldLabels from useFormsTable
    fetchForms, // Expose fetchForms for explicit refresh
  } = useFormsTable({
    searchTerm,
    visibleColumnIds, // Pass to hook, though primarily for column display in DataTable
    currentPage, // Pass currentPage to the hook
  });

  // Effect to set initial visible columns once allFieldLabels are available
  useEffect(() => {
    if (allFieldLabels.length > 0 && visibleColumnIds.length === 0) {
      // Define default visible columns for forms table
      const defaultVisible = ["formName", "details", "date", "status"]; // Example static columns
      // You might also want to include dynamic labels if forms had dynamic fields,
      // but typical forms table has fixed columns.
      setVisibleColumnIds(defaultVisible);
    }
  }, [allFieldLabels, visibleColumnIds]);

  // Handlers for FormTable actions
  const handleCreateNewForm = useCallback(() => {
    setFormIdToEdit(null); // Clear ID for new form
    setIsFormPanelReadOnly(false); // Enable editing
    setIsFormPanelOpen(true); // Open the panel
  }, []);

  const handleViewForm = useCallback((id: string) => {
    setFormIdToEdit(id);
    setIsFormPanelReadOnly(true); // Set to read-only
    setIsFormPanelOpen(true); // Open the panel
  }, []);

  const handleEditForm = useCallback((id: string) => {
    setFormIdToEdit(id);
    setIsFormPanelReadOnly(false); // Enable editing
    setIsFormPanelOpen(true); // Open the panel
  }, []);

  // Callback for when FormPanel needs to close (after create/update/cancel)
  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setFormIdToEdit(null); // Reset form ID
    setIsFormPanelReadOnly(false); // Reset read-only status
    fetchForms(); // Refresh the table after an action
  }, [fetchForms]);

  // Handlers for pagination from FormPanelContainer
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Handler for when DataTableControls' internal filter/search state changes
  const handleDataTableFilterChange = useCallback(
    ({
      searchTerm: newSearchTerm,
      visibleColumns: newVisibleColumnIds,
    }: {
      searchTerm: string;
      visibleColumns: string[];
    }) => {
      setSearchTerm(newSearchTerm);
      setVisibleColumnIds(newVisibleColumnIds);
      // When filters change, reset to the first page
      setCurrentPage(1);
    },
    []
  );

  // --- Conditional Rendering for Loading and Error States ---

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-red-500">
        You must be logged in to manage forms.
      </p>
    );
  }

  if (formId && loadingForm) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
        <p className="ml-2">Loading form details...</p>
      </div>
    );
  }

  if (formId && errorFetchingForm) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 space-y-4 text-center text-red-500">
        <p>Error: {errorFetchingForm}</p>
        <Button onClick={refetchForm}>Retry Loading Form</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
        <p className="ml-2">Loading forms table...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 space-y-2">
        <p>Error: {error}</p>
        <Button
          onClick={fetchForms} // Use fetchForms here
          className="flex items-center mx-auto gap-2"
        >
          <RefreshCcw size={16} /> Try Again
        </Button>
      </div>
    );
  }

  if (forms.length === 0 && !isFormPanelOpen) {
    return (
      <div className="space-y-6 text-center text-gray-500">
        <p>No forms found yet.</p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={fetchForms} // Use fetchForms here
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Refresh Forms
          </Button>
          {isAdmin && (
            <Button
              onClick={handleCreateNewForm}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Create New Form
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conditionally render FormPanel in a modal/overlay */}
      {isFormPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl relative max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <FormPanel
              setIsOpen={handleFormPanelClose}
              formId={formIdToEdit}
              isReadOnly={isFormPanelReadOnly}
              onFormUpdated={fetchForms} // Refresh table on form update/create
            />
          </div>
        </div>
      )}

      {/* Main content: Table and action buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={fetchForms} // Use fetchForms here
          className="flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Refresh
        </Button>
        {isAdmin && (
          <Button
            onClick={handleCreateNewForm}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Create New Form
          </Button>
        )}
      </div>
      <FormTable
        isAdmin={isAdmin}
        paginatedForms={paginatedForms} // Pass paginated forms from hook
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading} // Pass loading state
        error={error} // Pass error state
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        handleViewForm={handleViewForm}
        handleEditForm={handleEditForm}
        handleDeleteForm={handleDeleteForm} // Pass down delete handler
        isDeleting={isDeleting}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        formToDelete={formToDelete}
        handleDeleteConfirm={handleDeleteConfirm}
        // Pass filter states and change handler (NEW)
        onFilterChange={handleDataTableFilterChange}
        initialSearchTerm={searchTerm}
        initialVisibleColumns={visibleColumnIds}
      />
    </div>
  );
}