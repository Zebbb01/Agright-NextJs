// src/components/widget/ResponsePanel.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResponsePanelProps {
  formId: string;
  setIsOpen: (open: boolean) => void;
  userId: number;
}

interface FormOption {
  id: string;
  formId: string;
  label: string;
  type: string;
  options?: string[];
}

export default function ResponsePanel({
  formId,
  setIsOpen,
  userId,
}: ResponsePanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fields, setFields] = useState<FormOption[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({}); // To track upload state per field

  useEffect(() => {
    if (formId) {
      // Ensure the API path is correct, consider adding formId for options endpoint too
      // The options endpoint you provided earlier is: /api/routes/form/options/[formId]
      fetch(`/api/routes/form/options/${formId}`) // Corrected path
        .then((res) => res.json())
        .then((data) => setFields(data))
        .catch((error) =>
          console.error("Failed to fetch form options:", error)
        );
    }
  }, [formId]);

  const handleChange = (label: string, value: any) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleCheckboxChange = (label: string, value: string) => {
    const existing: string[] = formData[label] || [];
    handleChange(
      label,
      existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value]
    );
  };

  const handleFileChange = async (label: string, file: File | null) => {
    if (file) {
      setUploading((prev) => ({ ...prev, [label]: true }));
      try {
        const data = new FormData();
        data.append("file", file); // 'file' is the key your API expects

        const uploadRes = await fetch("/api/routes/form/upload", {
          // Use your new upload API route
          method: "POST",
          body: data,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }

        const { url } = await uploadRes.json();
        handleChange(label, url); // Store the URL in formData
      } catch (error) {
        console.error("Error uploading file:", error);
        handleChange(label, null); // Clear value or handle error state
        alert(`Failed to upload file for ${label}. Please try again.`);
      } finally {
        setUploading((prev) => ({ ...prev, [label]: false }));
      }
    } else {
      handleChange(label, null);
    }
  };

  const handleCreateResponse = async () => {
    // Check if any uploads are still in progress
    const isAnyUploading = Object.values(uploading).some(
      (status) => status === true
    );
    if (isAnyUploading) {
      alert("Please wait for all file uploads to complete.");
      return;
    }

    const payload = {
      formId,
      userId,
      values: formData,
    };

    console.log("Payload being sent:", payload);

    try {
      const res = await fetch("/api/routes/form/response", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        throw new Error(
          `Failed to create response: ${errorData.details || res.statusText}`
        );
      }

      setFormData({});
      setIsOpen(false);
      // Optionally, if you have a way to trigger a refresh in ResponsesTable:
      // This part would depend on how you designed the refresh mechanism.
      // For now, users can use the refresh button in ResponsesTable.
    } catch (error: any) {
      console.error("Error creating response:", error);
      alert(`Error submitting response: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow-md mb-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label>{field.label}</Label>

          {field.type === "Text" && (
            <Input
              placeholder={`Enter ${field.label}`}
              value={formData[field.label] || ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
          )}

          {field.type === "Date" && (
            <Input
              type="date"
              value={formData[field.label] || ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
          )}

          {field.type === "Radio" &&
            field.options?.map((opt) => (
              <div key={opt} className="flex items-center gap-2 ml-2">
                <input
                  type="radio"
                  name={field.label}
                  value={opt}
                  checked={formData[field.label] === opt}
                  onChange={() => handleChange(field.label, opt)}
                />
                <Label className="text-sm">{opt}</Label>
              </div>
            ))}

          {field.type === "Checkbox" &&
            field.options?.map((opt) => (
              <div key={opt} className="flex items-center gap-2 ml-2">
                <input
                  type="checkbox"
                  checked={(formData[field.label] || []).includes(opt)}
                  onChange={() => handleCheckboxChange(field.label, opt)}
                />
                <Label className="text-sm">{opt}</Label>
              </div>
            ))}

          {(field.type === "Image Upload" || field.type === "File Upload") && (
            <div>
              <Input
                type="file"
                accept={field.type === "Image Upload" ? "image/*" : "*"}
                onChange={(e) =>
                  handleFileChange(field.label, e.target.files?.[0] || null)
                }
                disabled={uploading[field.label]} // Disable if uploading
              />
              {uploading[field.label] && (
                <p className="text-sm text-blue-500">Uploading...</p>
              )}
              {formData[field.label] && !uploading[field.label] && (
                <p className="text-sm text-green-500">
                  Uploaded: {formData[field.label].split("/").pop()}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateResponse}
          disabled={Object.values(uploading).some((status) => status)}
        >
          Save Response
        </Button>
      </div>
    </div>
  );
}
