// src/components/widget/form/FormPanelContainer.tsx
"use client";

import { useState } from "react"; // Import useState
import FormPanel from "./FormPanel";
import FormTable from "../../data/FormTable";
import { Button } from "../../ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { Spinner } from "../../ui/spinner";
import { useFormManagement } from "@/hooks/form/useFormManagement"; // Adjust the import path as necessary
import { useFormsTable } from "@/hooks/form/useFormsTable";

interface Props {
  formId?: string; // Make formId optional as this container might manage creating forms without a specific ID
}

export default function FormPanelContainer({ formId }: Props) {
  // States for managing FormPanel visibility and mode
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [formIdToEdit, setFormIdToEdit] = useState<string | null>(null);
  const [isFormPanelReadOnly, setIsFormPanelReadOnly] = useState(false);

  const {
    loadingForm,
    errorFetchingForm,
    user,
    isLoadingAuth,
    isAdmin,
    refetchForm, // If you need to refetch the current form on specific events
  } = useFormManagement({ formId });

  const {
    handleRefreshForms,
    loading,
    error,
    forms,
    // Note: useFormsTable already has its own internal state management for `forms` and pagination.
    // It's not directly receiving `forms` as a prop from here.
  } = useFormsTable(); // This hook should provide `fetchForms` if you want to explicitly refresh the table.


  // Handlers for FormTable actions
  const handleCreateNewForm = () => {
    setFormIdToEdit(null); // Clear ID for new form
    setIsFormPanelReadOnly(false); // Enable editing
    setIsFormPanelOpen(true); // Open the panel
  };

  const handleViewForm = (id: string) => {
    setFormIdToEdit(id);
    setIsFormPanelReadOnly(true); // Set to read-only
    setIsFormPanelOpen(true); // Open the panel
  };

  const handleEditForm = (id: string) => {
    setFormIdToEdit(id);
    setIsFormPanelReadOnly(false); // Enable editing
    setIsFormPanelOpen(true); // Open the panel
  };

  // Callback for when FormPanel needs to close (after create/update/cancel)
  const handleFormPanelClose = () => {
    setIsFormPanelOpen(false);
    setFormIdToEdit(null); // Reset form ID
    setIsFormPanelReadOnly(false); // Reset read-only status
    handleRefreshForms(); // Refresh the table after an action
  };

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

  // Only show form-specific loading/error if formId is actually provided
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

  // --- Conditional Rendering for Loading and Error States (for the forms table itself) ---
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
          onClick={handleRefreshForms}
          className="flex items-center mx-auto gap-2"
        >
          <RefreshCcw size={16} /> Try Again
        </Button>
      </div>
    );
  }

  if (forms.length === 0 && !isFormPanelOpen) { // Check if no forms AND FormPanel is not open
    return (
      <div className="space-y-6 text-center text-gray-500">
        <p>No forms found yet.</p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleRefreshForms}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Refresh Forms
          </Button>
          {isAdmin && (
            <Button
              onClick={handleCreateNewForm} // Use new handler
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
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center overflow-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 relative max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <FormPanel
              setIsOpen={handleFormPanelClose} // Use the combined close handler
              formId={formIdToEdit}
              isReadOnly={isFormPanelReadOnly}
              onFormUpdated={handleRefreshForms} // Refresh table on form update/create
            />
          </div>
        </div>
      )}

      {/* Main content: Table and action buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handleRefreshForms}
          className="flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Refresh
        </Button>
        {isAdmin && (
          <Button
            onClick={handleCreateNewForm} // Use new handler
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Create New Form
          </Button>
        )}
      </div>
      <FormTable
        isAdmin={isAdmin}
        setIsCreating={setIsFormPanelOpen} // This prop is somewhat redundant with new handlers, but kept for compatibility
        handleViewForm={handleViewForm} // Pass handler
        handleEditForm={handleEditForm} // Pass handler
      />
    </div>
  );
}
