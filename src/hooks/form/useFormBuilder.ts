// src/hooks/form/useFormBuilder.ts
import { useState, useCallback } from "react";
import { FormField } from "@/types/form"; // Make sure FormField in types/form.ts includes 'required'
import { createFormAndOptionsService } from "@/app/api/services/formService";

interface UseFormBuilderProps {
  onFormCreated?: () => void;
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
  handleRequiredChange: (id: number, isRequired: boolean) => void; // <--- NEW
  handleCreateForm: () => Promise<void>;
  creatingForm: boolean;
  createFormError: string | null;
  resetFormBuilder: () => void;
}

export const useFormBuilder = ({ onFormCreated }: UseFormBuilderProps = {}): UseFormBuilderReturn => {
  const [formName, setFormName] = useState("");
  const [details, setDetails] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [creatingForm, setCreatingForm] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  const handleAddField = useCallback(() => {
    setFields((prevFields) => [
      ...prevFields,
      { id: Date.now(), type: "Text", label: "", required: false }, // <--- Initialize required to false
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

  // <--- NEW: handleRequiredChange function
  const handleRequiredChange = useCallback((id: number, isRequired: boolean) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, required: isRequired } : field
      )
    );
  }, []);

  const resetFormBuilder = useCallback(() => {
    setFormName("");
    setDetails("");
    setFields([]);
    setCreateFormError(null);
  }, []);

  const handleCreateForm = useCallback(async () => {
    if (!formName.trim()) {
      setCreateFormError("Form title cannot be empty.");
      return;
    }
    if (fields.length === 0) {
        setCreateFormError("Form must have at least one field.");
        return;
    }
    // Basic validation for field labels, especially for required fields
    for (const field of fields) {
        if (!field.label.trim()) {
            setCreateFormError(`Field with ID ${field.id} has an empty label. All fields must have a label.`);
            return;
        }
        // Additional validation for options if type is Radio/Checkbox
        if ((field.type === "Radio" || field.type === "Checkbox") && (!field.options || field.options.length === 0 || field.options.some(opt => !opt.trim()))) {
            setCreateFormError(`Field '${field.label}' of type ${field.type} must have at least one non-empty option.`);
            return;
        }
    }


    setCreatingForm(true);
    setCreateFormError(null);

    try {
      // Ensure that 'fields' array sent here contains the 'required' property for each field
      await createFormAndOptionsService({
        name: formName,
        details: details,
        date: new Date(),
        deletedAt: null
      }, fields); // 'fields' already contains the 'required' property from state

      console.log("Form and fields saved!");
      resetFormBuilder();
      onFormCreated?.();
    } catch (err: any) {
      console.error("Failed to save form:", err);
      setCreateFormError(err.message || "Failed to save form.");
    } finally {
      setCreatingForm(false);
    }
  }, [formName, details, fields, onFormCreated, resetFormBuilder]);

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
    handleRequiredChange, // <--- RETURN NEW FUNCTION
    handleCreateForm,
    creatingForm,
    createFormError,
    resetFormBuilder,
  };
};