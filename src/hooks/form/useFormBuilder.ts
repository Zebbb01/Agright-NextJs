// src/hooks/form/useFormBuilder.ts
import { useState, useCallback, useEffect } from "react";
import { FormField, Form } from "@/types/form";
import { createFormAndOptionsService, fetchFormByIdService, updateFormAndOptionsService } from "@/app/api/services/formService";
import { toast } from "sonner";

interface UseFormBuilderProps {
  formId?: string | null;
  onFormCreated?: () => void;
  onFormUpdated?: () => void;
}

interface UseFormBuilderReturn {
  formName: string;
  setFormName: (name: string) => void;
  details: string;
  setDetails: (details: string) => void;
  fields: FormField[];
  handleAddField: () => void;
  handleFieldChange: (id: number, key: keyof FormField, value: any) => void;
  handleRemoveField: (id: number) => void;
  handleOptionChange: (fieldId: number, index: number, value: string) => void;
  addOption: (fieldId: number) => void;
  removeOption: (fieldId: number, index: number) => void;
  handleRequiredChange: (id: number, isRequired: boolean) => void;
  handleCreateForm: () => Promise<void>;
  handleUpdateForm: (formId: string) => Promise<void>;
  fetchFormForEdit: (formId: string) => Promise<void>;
  creatingForm: boolean;
  updatingForm: boolean;
  createFormError: string | null;
  updateFormError: string | null;
  isFormBuilderInvalid: boolean;
  resetFormBuilder: () => void;
}

export const useFormBuilder = ({
  formId = null,
  onFormCreated,
  onFormUpdated,
}: UseFormBuilderProps = {}): UseFormBuilderReturn => {
  const [formName, setFormName] = useState("");
  const [details, setDetails] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [creatingForm, setCreatingForm] = useState(false);
  const [updatingForm, setUpdatingForm] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [updateFormError, setUpdateFormError] = useState<string | null>(null);

  // --- Utility Functions ---

  const generateNewFieldId = () => Date.now() + Math.floor(Math.random() * 1000);

  const resetFormBuilder = useCallback(() => {
    setFormName("");
    setDetails("");
    setFields([]);
    setCreateFormError(null);
    setUpdateFormError(null);
  }, []);

  // --- Fetching Existing Form Data ---

  const fetchFormForEdit = useCallback(async (id: string) => {
    setUpdatingForm(true); // Indicate loading
    setUpdateFormError(null);
    try {
      // fetchFormByIdService now maps 'options' to 'fields'
      const fetchedForm = await fetchFormByIdService(id);
      setFormName(fetchedForm.name);
      setDetails(fetchedForm.details || "");
      // fetchedForm.fields should now be correctly populated by the service
      const mappedFields: FormField[] = fetchedForm.fields.map((field: any) => ({
        id: generateNewFieldId(), // Generate a new local ID for editing purposes
        type: field.type,
        label: field.label,
        options: field.options || (field.type === "Radio" || field.type === "Checkbox" ? [""] : undefined),
        required: field.required || false,
      }));
      setFields(mappedFields);
    } catch (err: any) {
      console.error("Failed to fetch form for edit:", err);
      setUpdateFormError(err.message || "Failed to load form for editing.");
      toast.error("Failed to load form", {
        description: err.message || "Please try again.",
      });
    } finally {
      setUpdatingForm(false);
    }
  }, []);

  // --- Field Management Handlers ---

  const handleAddField = useCallback(() => {
    setFields((prevFields) => [
      ...prevFields,
      { id: generateNewFieldId(), type: "Text", label: "", required: false },
    ]);
  }, []);

  const handleFieldChange = useCallback((id: number, key: keyof FormField, value: any) => {
    setFields((prevFields) =>
      prevFields.map((f) => {
        if (f.id === id) {
          if (key === "type" && (value === "Radio" || value === "Checkbox")) {
            return { ...f, [key]: value, options: [""] };
          } else if (key === "type") {
            const { options, ...rest } = f;
            return { ...rest, [key]: value };
          }
          return { ...f, [key]: value };
        }
        return f;
      })
    );
  }, []);

  const handleRemoveField = useCallback((id: number) => {
    setFields((prevFields) => prevFields.filter((f) => f.id !== id));
  }, []);

  const handleOptionChange = useCallback((fieldId: number, index: number, value: string) => {
    setFields((prevFields) =>
      prevFields.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOptions = [...f.options];
          newOptions[index] = value;
          return { ...f, options: newOptions };
        }
        return f;
      })
    );
  }, []);

  const addOption = useCallback((fieldId: number) => {
    setFields((prevFields) =>
      prevFields.map((f) => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: [...f.options, ""] };
        }
        return f;
      })
    );
  }, []);

  const removeOption = useCallback((fieldId: number, index: number) => {
    setFields((prevFields) =>
      prevFields.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOptions = f.options.filter((_, i) => i !== index);
          return { ...f, options: newOptions };
        }
        return f;
      })
    );
  }, []);

  const handleRequiredChange = useCallback((id: number, isRequired: boolean) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, required: isRequired } : field
      )
    );
  }, []);

  // --- Validation Logic ---

  const validateForm = useCallback(() => {
    if (!formName.trim()) {
      return "Form title cannot be empty.";
    }
    if (fields.length === 0) {
      return "Form must have at least one field.";
    }
    for (const field of fields) {
      if (!field.label.trim()) {
        return `Field with type '${field.type}' has an empty label. All fields must have a label.`;
      }
      if ((field.type === "Radio" || field.type === "Checkbox") && (!field.options || field.options.length === 0 || field.options.some(opt => !opt.trim()))) {
        return `Field '${field.label}' of type '${field.type}' must have at least one non-empty option.` ;
      }
    }
    return null; // No errors
  }, [formName, fields]);

  // Derived state for button disability
  const isFormBuilderInvalid = !!validateForm();

  // --- Form Submission Handlers (Create & Update) ---

  const handleCreateForm = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      setCreateFormError(validationError);
      return;
    }

    setCreatingForm(true);
    setCreateFormError(null);

    try {
      await createFormAndOptionsService({
        name: formName,
        details: details,
        date: new Date(),
        deletedAt: null // New forms are not deleted
      }, fields);

      toast.success("Form created successfully!");
      resetFormBuilder();
      onFormCreated?.();
    } catch (err: any) {
      console.error("Failed to save form:", err);
      setCreateFormError(err.message || "Failed to save form.");
      toast.error("Failed to create form", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setCreatingForm(false);
    }
  }, [formName, details, fields, onFormCreated, resetFormBuilder, validateForm]);


  const handleUpdateForm = useCallback(async (id: string) => {
    const validationError = validateForm();
    if (validationError) {
      setUpdateFormError(validationError);
      return;
    }

    setUpdatingForm(true);
    setUpdateFormError(null);

    try {
      await updateFormAndOptionsService(id, {
        name: formName,
        details: details,
        // No date update unless explicitly needed
        // No deletedAt update here, handled by delete/restore
      }, fields); // Pass updated fields

      toast.success("Form updated successfully!");
      resetFormBuilder();
      onFormUpdated?.();
    } catch (err: any) {
      console.error("Failed to update form:", err);
      setUpdateFormError(err.message || "Failed to update form.");
      toast.error("Failed to update form", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setUpdatingForm(false);
    }
  }, [formName, details, fields, onFormUpdated, resetFormBuilder, validateForm]);


  // --- Exported Values ---

  return {
    formName,
    setFormName,
    details,
    setDetails,
    fields,
    handleAddField,
    handleFieldChange,
    handleRemoveField,
    handleOptionChange,
    addOption,
    removeOption,
    handleRequiredChange,
    handleCreateForm,
    handleUpdateForm,
    fetchFormForEdit,
    creatingForm,
    updatingForm,
    createFormError,
    updateFormError,
    isFormBuilderInvalid,
    resetFormBuilder,
  };
};
