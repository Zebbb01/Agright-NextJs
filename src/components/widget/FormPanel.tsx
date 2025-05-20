"use client";

import { useState } from "react";
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
import { Form } from "@/types/form";

type FormField = {
  id: number;
  type: string;
  label: string;
  options?: string[];
};

type Props = {
  setIsOpen: (open: boolean) => void;
  form: Form;
};

const inputTypes = [
  "Text",
  "Textarea",
  "Radio",
  "Checkbox",
  "Date",
  "Image Upload",
  "File Upload",
];

export default function FormPanel({ setIsOpen }: Props) {
  const [formName, setFormName] = useState("");
  const [details, setDetails] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const handleAddField = () => {
    setFields([...fields, { id: Date.now(), type: "Text", label: "" }]);
  };

  const handleFieldChange = (id: number, key: keyof FormField, value: any) => {
    setFields(
      fields.map((f) => {
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
  };

  const handleRemoveField = (id: number) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleOptionChange = (
    fieldId: number,
    index: number,
    value: string
  ) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOptions = [...f.options];
          newOptions[index] = value;
          return { ...f, options: newOptions };
        }
        return f;
      })
    );
  };

  const addOption = (fieldId: number) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: [...f.options, ""] };
        }
        return f;
      })
    );
  };

  const removeOption = (fieldId: number, index: number) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOptions = f.options.filter((_, i) => i !== index);
          return { ...f, options: newOptions };
        }
        return f;
      })
    );
  };

  const handleCreateForm = async () => {
    if (!formName.trim()) return;

    try {
      // Step 1: Create the form
      const res = await fetch("/api/routes/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          details: details,
          date: new Date(),
        }),
      });

      const createdForm = await res.json();

      // Step 2: Create form options
      await Promise.all(
        fields.map((field) =>
          fetch("/api/routes/form/options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              formId: createdForm.id,
              label: field.label,
              type: field.type,
              options: field.options || [],
            }),
          })
        )
      );

      console.log("Form and fields saved!");

      // Clear inputs
      setFormName("");
      setDetails("");
      setFields([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to save form:", err);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6 border p-6 rounded-xl shadow-md mb-8">
      <div className="space-y-2">
        <Label>Form Title</Label>
        <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Form Description</Label>
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="border p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label>Question Label</Label>
                <Input
                  placeholder="Enter question label"
                  value={field.label}
                  onChange={(e) =>
                    handleFieldChange(field.id, "label", e.target.value)
                  }
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(val) =>
                    handleFieldChange(field.id, "type", val)
                  }
                >
                  <SelectTrigger>
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

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleAddField}>
          <Plus size={16} className="mr-2" />
          Add Field
        </Button>
        <div className="ml-auto flex gap-2">
          <Button variant="destructive" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateForm}>Save Form</Button>
        </div>
      </div>
    </div>
  );
}
