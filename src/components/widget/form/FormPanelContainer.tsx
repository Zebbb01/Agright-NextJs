// src/components/widget/form/FormPanelContainer.tsx
"use client";

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
  const {
    isCreating,
    setIsCreating,
    loadingForm,
    errorFetchingForm,
    user,
    isLoadingAuth,
    isAdmin,
    refetchForm, // If you need to refetch the current form on specific events
  } = useFormManagement({ formId });

  const {
    handleRefreshForms,
    loading, // <-- Add these three lines
    error,
    forms,
  } = useFormsTable();

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

  // --- Conditional Rendering for Loading and Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
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

  if (forms.length === 0) {
    return (
      <div className="text-center text-gray-500 space-y-2">
        <p>No forms found yet.</p>
        <Button
          onClick={handleRefreshForms}
          className="mt-4 flex items-center mx-auto gap-2"
        >
          <RefreshCcw size={16} /> Refresh Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCreating ? (
        <div className="flex justify-center mx-auto mb-4">
          <FormPanel
            setIsOpen={setIsCreating}
            // If FormPanel was for editing, you'd pass 'form' here:
            // form={form}
          />
        </div>
      ) : (
        <>
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
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create New Form
              </Button>
            )}
          </div>
          <FormTable setIsCreating={setIsCreating} isAdmin={isAdmin} />
        </>
      )}
    </div>
  );
}
