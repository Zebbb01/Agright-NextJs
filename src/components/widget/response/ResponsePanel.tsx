// src/components/widget/response/ResponsePanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useFormResponse } from "@/hooks/form/useFormResponse";


interface ResponsePanelProps {
  formId: string;
  setIsOpen: (open: boolean) => void;
  userId: number;
}

export default function ResponsePanel({
  formId,
  setIsOpen,
  userId,
}: ResponsePanelProps) {
  const {
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
  } = useFormResponse({ formId, userId });

  const onSubmit = async () => {
    const success = await handleSubmitResponse();
    if (success) {
      setIsOpen(false);
      resetForm(); // Reset form data on successful submission
    }
  };

  // --- Conditional Rendering for Loading and Error States ---
  if (loadingFields) {
    return (
      <div className="flex justify-center items-center h-48 w-full">
        <Spinner />
      </div>
    );
  }

  if (errorFetchingFields) {
    return (
      <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow-md mb-6 text-center text-red-500">
        <p>Error: {errorFetchingFields}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>{" "}
        {/* Simple retry, consider more sophisticated error recovery */}
        <Button variant="destructive" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow-md mb-6 text-center text-gray-500">
        <p>No form fields defined for this form.</p>
        <Button variant="destructive" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4 border p-6 rounded-xl shadow-md mb-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label className="text-lg font-semibold text--foreground">
            {field.label}
          </Label>

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
                  style={{ accentColor: "var(--foreground)" }}
                  className="w-4 h-4"
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
                  style={{ accentColor: "var(--foreground)" }}
                  className="w-4 h-4 rounded"
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
                disabled={uploading[field.label]}
              />
              {uploading[field.label] && (
                <p className="text-sm text-blue-500">Uploading...</p>
              )}
              {/* Display the uploaded image if it's an image upload and available */}
              {formData[field.label] && typeof formData[field.label] === 'string' && (
                <div className="mt-2">
                  {field.type === "Image Upload" ? (
                    <img
                      src={formData[field.label]}
                      alt="Uploaded image"
                      className="max-w-full h-auto max-h-48 object-contain rounded-md"
                    />
                  ) : (
                    <p className="text-sm text-green-500">
                      Uploaded: <a href={formData[field.label]} target="_blank" rel="noopener noreferrer">{formData[field.label].split("/").pop()}</a>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {errorSubmittingResponse && (
        <p className="text-red-500 text-sm mt-2">
          Submission Error: {errorSubmittingResponse}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={
            Object.values(uploading).some((status) => status) ||
            submittingResponse
          }
        >
          {submittingResponse ? (
            <>
              <Spinner />
            </>
          ) : (
            "Save Response"
          )}
        </Button>
      </div>
    </div>
  );
}