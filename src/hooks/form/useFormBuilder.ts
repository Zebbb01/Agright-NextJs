// src/hooks/useFormBuilder.ts
import { useState, useCallback } from "react";
import { FormField } from "@/types/form";
import { createFormAndOptionsService } from "@/app/api/services/formService"; // Corrected import path

interface UseFormBuilderProps {
  onFormCreated?: () => void; // Callback for successful form creation
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
  handleCreateForm: () => Promise<void>;
  creatingForm: boolean;
  createFormError: string | null;
  resetFormBuilder: () => void; // Function to reset the form builder state
}



export const useFormBuilder = ({ onFormCreated }: UseFormBuilderProps = {}): UseFormBuilderReturn => {
  const [formName, setFormName] = useState("");
  const [details, setDetails] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [creatingForm, setCreatingForm] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  const handleAddField = useCallback(() => {
    setFields((prevFields) => [...prevFields, { id: Date.now(), type: "Text", label: "" }]);
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

    setCreatingForm(true);
    setCreateFormError(null);

    try {
      await createFormAndOptionsService({
        name: formName,
        details: details,
        date: new Date(),
      }, fields);

      console.log("Form and fields saved!");
      resetFormBuilder();
      onFormCreated?.(); // Call the callback if provided
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
    handleCreateForm,
    creatingForm,
    createFormError,
    resetFormBuilder,
  };
};