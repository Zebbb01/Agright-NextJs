// src/hooks/form/useFormResponse.ts
import { useMemo, useCallback } from "react";
import { FormData, FormOption } from "@/types/form";
import { useFormFieldsAndData } from "./useFormFieldsAndData";
import { useFormFileUpload } from "./useFormFileUpload";
import { useFormSubmission } from "./useFormSubmission";
import { useFormEditing } from "./useFormEditing";
import { useFormDeletion } from "./useFormDeletion";

interface UseFormResponseProps {
  formId: string;
  userId: number;
}

interface UseFormResponseReturn {
  formData: FormData;
  fields: FormOption[];
  uploading: Record<string, boolean>;
  loadingFields: boolean;
  errorFetchingFields: string | null;
  submittingResponse: boolean;
  errorSubmittingResponse: string | null;
  handleChange: (label: string, value: any) => void;
  handleCheckboxChange: (label: string, value: string) => void;
  handleFileChange: (label: string, file: File | null) => Promise<void>;
  handleSubmitResponse: (responseId?: string | null) => Promise<boolean>;
  resetForm: () => void;
  isFormInvalid: boolean;
  getImageTakenDate: (label: string) => string | null;
  loadingInitialResponse: boolean;
  errorLoadingInitialResponse: string | null;
  fetchResponseForEdit: (responseId: string) => Promise<void>;
  handlePermanentDeleteResponse: (responseId: number) => Promise<boolean>;
  deletingResponse: boolean;
  errorDeletingResponse: string | null;
}

/**
 * useFormResponse Hook
 *
 * This is the main custom hook for managing form responses. It composes
 * several smaller, specialized hooks to handle different aspects of form
 * functionality, including field management, data handling, file uploads,
 * submission, editing, and deletion. This composition promotes modularity
 * and separation of concerns.
 *
 * @param {UseFormResponseProps} props - The properties for the hook, including
 * the form ID and user ID.
 * @returns {UseFormResponseReturn} An object containing all states, handlers,
 * and utility functions for managing a form response.
 */
export const useFormResponse = ({
  formId,
  userId,
}: UseFormResponseProps): UseFormResponseReturn => {
  // 1. Core Form Fields and Data Management
  const {
    formData,
    fields,
    loadingFields,
    errorFetchingFields,
    handleChange,
    handleCheckboxChange,
    resetFormFields,
    setFormData, // Exposed for editing hook
    setFields,   // Exposed for editing hook if needed, though fields are usually fetched once
  } = useFormFieldsAndData({ formId });

  // 2. File Upload Management
  const {
    uploading,
    imageTakenDates,
    handleFileChange,
    getImageTakenDate,
    resetFileUploadState,
    setImageTakenDates, // Exposed for editing hook
  } = useFormFileUpload({ handleChange, formData }); // Pass handleChange and formData

  // 3. Form Editing Management
  const {
    loadingInitialResponse,
    errorLoadingInitialResponse,
    fetchResponseForEdit,
  } = useFormEditing({ setFormData, setImageTakenDates, fields }); // Pass setters and fields

  // 4. Form Validation Logic
  const isFormInvalid = useMemo(() => {
    // If fields haven't loaded yet, consider it invalid for disabling purposes
    if (loadingFields || fields.length === 0 || loadingInitialResponse) return true;

    // Check if any required field is empty or if any file uploads are in progress
    for (const field of fields) {
      if (field.required) {
        const value = formData[field.label];
        let isEmpty = false;

        if (field.type === "Checkbox") {
          isEmpty = !Array.isArray(value) || value.length === 0;
        } else if (
          field.type === "Image Upload" ||
          field.type === "File Upload"
        ) {
          // For file uploads, ensure a string (URL) exists and is not empty
          isEmpty = typeof value !== "string" || value.trim() === "";
        } else {
          // Check for null, undefined, or empty string (after trimming)
          isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "");
        }

        if (isEmpty) {
          return true; // Found an empty required field
        }
      }
      // Also check if any file upload for this field is still in progress
      if (uploading[field.label]) {
        return true;
      }
    }

    return false; // If no empty required fields and no uploads in progress, the form is valid
  }, [formData, fields, loadingFields, uploading, loadingInitialResponse]);

  // Callback to reset all form-related states after successful submission or cancellation
  const resetForm = useCallback(() => {
    resetFormFields(); // Reset core form data based on fields
    resetFileUploadState(); // Reset upload-related states
    // Any other state resets from other hooks can be added here
  }, [resetFormFields, resetFileUploadState]);

  // 5. Form Submission Management
  const {
    submittingResponse,
    errorSubmittingResponse,
    handleSubmitResponse,
  } = useFormSubmission({
    formId,
    userId,
    formData,
    fields,
    isFormInvalid,
    onSuccess: resetForm, // Pass the combined reset function as success callback
  });

  // 6. Form Deletion Management
  const {
    deletingResponse,
    errorDeletingResponse,
    handlePermanentDeleteResponse,
  } = useFormDeletion();

  return {
    formData,
    fields,
    uploading,
    loadingFields,
    errorFetchingFields,
    submittingResponse,
    errorSubmittingResponse,
    handleChange,
    handleCheckboxChange,
    handleFileChange,
    handleSubmitResponse,
    resetForm,
    isFormInvalid,
    getImageTakenDate,
    loadingInitialResponse,
    errorLoadingInitialResponse,
    fetchResponseForEdit,
    handlePermanentDeleteResponse,
    deletingResponse,
    errorDeletingResponse,
  };
};
