// src/components/widget/form/FormPanel.tsx
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

type Props = {
  setIsOpen: (open: boolean) => void;
};

export default function FormPanel({ setIsOpen }: Props) {
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
    handleRequiredChange, // <--- IMPORT THIS
    handleCreateForm,
    creatingForm,
    createFormError,
    resetFormBuilder,
  } = useFormBuilder({
    onFormCreated: () => {
      setIsOpen(false);
    },
  });

  const onSubmit = async () => {
    await handleCreateForm();
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

  return (
    <div className="w-full max-w-3xl space-y-6 border p-6 rounded-xl shadow-md mb-8">
      <div className="space-y-2">
        <Label htmlFor="form-title">Form Title</Label>
        <Input id="form-title" value={formName} onChange={(e) => setFormName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-description">Form Description</Label>
        <Textarea
          id="form-description"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="border p-4 rounded-lg space-y-4">
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
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`type-${field.id}`}>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(val) =>
                    handleFieldChange(field.id, "type", val)
                  }
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
                  checked={field.required || false} // Ensure it's never undefined
                  onChange={(e) => handleRequiredChange(field.id, e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="mt-6"
                onClick={() => handleRemoveField(field.id)}
              >
                <Trash2 className="text-red-500" />
              </Button>
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
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(field.id, idx)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => addOption(field.id)}>
                  <Plus size={16} className="mr-2" />
                  Add Option
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {createFormError && (
        <p className="text-red-500 text-sm mt-2">{createFormError}</p>
      )}

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleAddField}>
          <Plus size={16} className="mr-2" />
          Add Field
        </Button>
        <div className="ml-auto flex gap-2">
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={creatingForm}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={creatingForm}>
            {creatingForm ? (
              <>
                <Spinner />
              </>
            ) : (
              "Save Form"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}