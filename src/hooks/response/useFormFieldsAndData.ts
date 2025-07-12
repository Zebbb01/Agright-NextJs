// src/hooks/form/useFormFieldsAndData.ts
import { useState, useEffect, useCallback } from "react";
import { FormOption, FormData } from "@/types/form";
import { fetchFormOptionsService } from "@/services";

interface UseFormFieldsAndDataProps {
  formId: string;
}

interface UseFormFieldsAndDataReturn {
  formData: FormData;
  fields: FormOption[];
  loadingFields: boolean;
  errorFetchingFields: string | null;
  handleChange: (label: string, value: any) => void;
  handleCheckboxChange: (label: string, value: string) => void;
  resetFormFields: () => void; // Renamed to avoid conflict with full form reset
  setFormData: React.Dispatch<React.SetStateAction<FormData>>; // Expose setter for external updates (e.g., editing)
  setFields: React.Dispatch<React.SetStateAction<FormOption[]>>; // Expose setter for external updates
}

/**
 * useFormFieldsAndData Hook
 *
 * Manages the fetching of form field definitions and the state of the form data.
 * Provides handlers for text/date inputs and checkbox changes.
 *
 * @param {UseFormFieldsAndDataProps} props - The properties for the hook.
 * @returns {UseFormFieldsAndDataReturn} An object containing form data, fields,
 * loading/error states, and change handlers.
 */
export const useFormFieldsAndData = ({
  formId,
}: UseFormFieldsAndDataProps): UseFormFieldsAndDataReturn => {
  const [formData, setFormData] = useState<FormData>({});
  const [fields, setFields] = useState<FormOption[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [errorFetchingFields, setErrorFetchingFields] = useState<string | null>(
    null
  );

  // Initializes formData based on fetched fields
  const initializeFormData = useCallback((formOptions: FormOption[]) => {
    const initialData: FormData = {};
    formOptions.forEach((field) => {
      if (field.type === "Checkbox") {
        initialData[field.label] = [];
      } else if (
        field.type === "Image Upload" ||
        field.type === "File Upload"
      ) {
        initialData[field.label] = null;
        initialData[`${field.label}DbId`] = null; // For storing database ID of uploaded file
      } else {
        initialData[field.label] = "";
      }
    });
    setFormData(initialData);
  }, []);

  // Fetch form options (fields)
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingFields(true);
      setErrorFetchingFields(null);
      try {
        const data = await fetchFormOptionsService(formId);
        setFields(data);
        initializeFormData(data); // Initialize form data once fields are loaded
      } catch (error: any) {
        console.error("Failed to fetch form options:", error);
        setErrorFetchingFields(error.message || "Failed to load form fields.");
      } finally {
        setLoadingFields(false);
      }
    };

    if (formId) {
      fetchOptions();
    }
  }, [formId, initializeFormData]);

  // Handle changes for text, date, and radio inputs
  const handleChange = useCallback((label: string, value: any) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  }, []);

  // Handle changes for checkbox inputs
  const handleCheckboxChange = useCallback(
    (label: string, value: string) => {
      const existing: string[] = formData[label] || [];
      handleChange(
        label,
        existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value]
      );
    },
    [formData, handleChange]
  );

  // Resets only the form data based on current fields
  const resetFormFields = useCallback(() => {
    initializeFormData(fields);
  }, [fields, initializeFormData]);

  return {
    formData,
    fields,
    loadingFields,
    errorFetchingFields,
    handleChange,
    handleCheckboxChange,
    resetFormFields,
    setFormData,
    setFields,
  };
};
