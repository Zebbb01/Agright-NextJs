"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useFormBuilder } from "@/hooks/form/useFormBuilder";
import { useEffect } from "react"; // Import useEffect

type Props = {
  setIsOpen: (open: boolean) => void;
  formId?: string | null; // NEW: Optional formId for editing/viewing
  isReadOnly?: boolean; // NEW: Optional flag for view mode
  onFormUpdated?: () => void; // NEW: Callback for when a form is updated
};

export default function FormPanel({
  setIsOpen,
  formId = null, // Default to null
  isReadOnly = false, // Default to false
  onFormUpdated, // Destructure new prop
}: Props) {
  const {
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
    handleUpdateForm, // NEW: Function to handle form updates
    fetchFormForEdit, // NEW: Function to fetch form data for editing
    creatingForm,
    updatingForm, // NEW: State for update loading
    createFormError,
    updateFormError, // NEW: State for update error
    resetFormBuilder,
    isFormBuilderInvalid, // NEW: State for form validation
  } = useFormBuilder({
    formId: formId, // Pass formId to the hook
    onFormCreated: () => {
      setIsOpen(false);
      resetFormBuilder();
    },
    onFormUpdated: () => { // NEW: Handle form update callback
      setIsOpen(false);
      resetFormBuilder();
      if (onFormUpdated) {
        onFormUpdated();
      }
    },
  });

  // NEW: useEffect to fetch form data when formId changes
  useEffect(() => {
    if (formId) {
      fetchFormForEdit(formId);
    } else {
      // If no formId is provided (i.e., creating a new form), reset the builder
      resetFormBuilder();
    }
  }, [formId, fetchFormForEdit, resetFormBuilder]);


  const onSubmit = async () => {
    if (formId) {
      await handleUpdateForm(formId); // Call update if formId exists
    } else {
      await handleCreateForm(); // Call create if no formId
    }
  };

  const onCancel = () => {
    resetFormBuilder();
    setIsOpen(false);
  };

  const inputTypes = [
    "Text",
    "Radio",
    "Checkbox",
    "Date",
    "Image Upload",
    "File Upload",
  ];

  const isLoading = creatingForm || updatingForm;

  return (
    <div className="w-full max-w-3xl space-y-6 p-6 ">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {isReadOnly ? "View Form" : formId ? "Edit Form" : "Create New Form"}
        </h3>
        <p className="text-sm text-gray-600">
          {isReadOnly
            ? "This form is in read-only mode."
            : formId
            ? "Modify the form details and fields below."
            : "Define the structure and fields for your new form."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-title">Form Title</Label>
        <Input
          id="form-title"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          readOnly={isReadOnly} // Set readOnly
          disabled={isReadOnly} // Disable if readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-description">Form Description</Label>
        <Textarea
          id="form-description"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          readOnly={isReadOnly} // Set readOnly
          disabled={isReadOnly} // Disable if readOnly
        />
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`label-${field.id}`}>Question Label</Label>
                <Input
                  id={`label-${field.id}`}
                  placeholder="Enter question label"
                  value={field.label}
                  onChange={(e) =>
                    handleFieldChange(field.id, "label", e.target.value)
                  }
                  readOnly={isReadOnly} // Set readOnly
                  disabled={isReadOnly} // Disable if readOnly
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`type-${field.id}`}>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(val) =>
                    handleFieldChange(field.id, "type", val)
                  }
                  disabled={isReadOnly} // Disable if readOnly
                >
                  <SelectTrigger id={`type-${field.id}`}>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {inputTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* REQUIRED CHECKBOX */}
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id={`required-${field.id}`}
                  checked={field.required || false}
                  onChange={(e) => handleRequiredChange(field.id, e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  disabled={isReadOnly} // Disable if readOnly
                />
                <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
              </div>

              {!isReadOnly && ( // Only show remove button if not read-only
                <Button
                  size="icon"
                  variant="ghost"
                  className="mt-6"
                  onClick={() => handleRemoveField(field.id)}
                >
                  <Trash2 className="text-red-500" />
                </Button>
              )}
            </div>

            {(field.type === "Radio" || field.type === "Checkbox") && (
              <div className="space-y-2">
                <Label>Options</Label>
                {field.options?.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(field.id, idx, e.target.value)
                      }
                      readOnly={isReadOnly} // Set readOnly
                      disabled={isReadOnly} // Disable if readOnly
                    />
                    {!isReadOnly && ( // Only show remove option button if not read-only
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOption(field.id, idx)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isReadOnly && ( // Only show add option button if not read-only
                  <Button variant="outline" onClick={() => addOption(field.id)}>
                    <Plus size={16} className="mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {(createFormError || updateFormError) && ( // Display errors for create or update
        <p className="text-red-500 text-sm mt-2">{createFormError || updateFormError}</p>
      )}

      <div className="flex items-center gap-4">
        {!isReadOnly && ( // Only show add field button if not read-only
          <Button variant="outline" onClick={handleAddField}>
            <Plus size={16} className="mr-2" />
            Add Field
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={isLoading}
          >
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && ( // Only show save button if not read-only
            <Button onClick={onSubmit} disabled={isLoading || isFormBuilderInvalid}>
              {isLoading ? (
                <>
                  <Spinner />
                  <span>{formId ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                formId ? "Save Changes" : "Save Form"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
