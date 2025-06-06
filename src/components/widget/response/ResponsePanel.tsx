// src/components/widget/response/ResponsePanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useFormResponse } from "@/hooks/form/useFormResponse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useState } from "react";

interface ResponsePanelProps {
  formId: string;
  setIsOpen: (open: boolean) => void;
  userId: number;
  // ADD THIS LINE: Declare onResponseAdded as an optional function
  onResponseAdded?: () => void;
}

export default function ResponsePanel({
  formId,
  setIsOpen,
  userId,
  // ADD THIS LINE: Destructure the new prop
  onResponseAdded,
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
    isFormInvalid,
    getImageTakenDate,
  } = useFormResponse({ formId, userId });


  const onSubmit = async () => {
    console.log("Form submission started...");
    try {
      const success = await handleSubmitResponse();
      if (success) {
        console.log("Form submitted successfully, showing success toast...");

        // Show success toast
        toast.success("Success!", {
          description: "Your form has been submitted successfully.",
          duration: 3000,
        });

        // Reset form
        resetForm();

        // Close panel after a short delay
        setTimeout(() => {
          setIsOpen(false);
          // CALL THE NEW PROP HERE: Notify parent that a response was added
          if (onResponseAdded) {
            onResponseAdded();
          }
        }, 1500);
      } else {
        console.log("Form submission failed");
        // Show error toast if no specific error message
        if (!errorSubmittingResponse) {
          toast.error("Submission Failed", {
            description: "There was an error submitting your form. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Submission Failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

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
        <Button onClick={() => window.location.reload()}>Retry</Button>
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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Form Response</h3>
        <p className="text-sm text-gray-600">
          Fill out all required fields. Location data and image metadata will be
          saved when you submit the form.
        </p>
      </div>

      {/* Error alert - only show for submission errors */}
      {errorSubmittingResponse && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>
            {errorSubmittingResponse}
          </AlertDescription>
        </Alert>
      )}

      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label className="text-lg font-semibold text-foreground">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {field.type === "Text" && (
            <Input
              placeholder={`Enter ${field.label}`}
              value={formData[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === "Date" && (
            <Input
              type="date"
              value={formData[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
            />
          )}

          {/* Radio Buttons in 2 Columns */}
          {field.type === "Radio" && field.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {field.options.map((opt, index) => (
                <div key={opt} className="flex items-center gap-2 ml-2 mb-2">
                  <input
                    type="radio"
                    name={field.label}
                    value={opt}
                    checked={formData[field.label] === opt}
                    onChange={() => handleChange(field.label, opt)}
                    style={{ accentColor: "var(--foreground)" }}
                    className="w-4 h-4"
                    required={field.required && !formData[field.label]}
                  />
                  <Label className="text-sm">{opt}</Label>
                </div>
              ))}
            </div>
          )}

          {/* Checkboxes in 2 Columns */}
          {field.type === "Checkbox" && field.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {field.options.map((opt, index) => (
                <div key={opt} className="flex items-center gap-2 ml-2 mb-2">
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
            </div>
          )}

          {(field.type === "Image Upload" || field.type === "File Upload") && (
            <div>
              <Input
                type="file"
                accept={field.type === "Image Upload" ? "image/*" : "*"}
                onChange={(e) =>
                  handleFileChange(field.label, e.target.files?.[0] || null)
                }
                disabled={uploading[field.label]}
                required={field.required}
              />
              {uploading[field.label] && (
                <div className="flex items-center gap-2 mt-2">
                  <Spinner />
                  <p className="text-sm text-blue-500">
                    Uploading {field.type.toLowerCase()}...
                  </p>
                </div>
              )}
              {formData[field.label] &&
                typeof formData[field.label] === "string" && (
                  <div className="mt-2">
                    {field.type === "Image Upload" ? (
                      <div>
                        <img
                          src={formData[field.label]}
                          alt="Uploaded image"
                          className="max-w-full h-auto max-h-48 object-contain rounded-md"
                        />
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-green-600">
                            ✓ Image uploaded successfully. Location data will be
                            extracted and saved when you submit the form.
                          </p>
                          {getImageTakenDate(field.label) && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                              <svg
                                className="w-4 h-4 text-blue-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <p className="text-xs font-medium text-blue-700">
                                  Photo taken:
                                </p>
                                <p className="text-xs text-blue-600">
                                  {getImageTakenDate(field.label)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-green-500">
                          Uploaded:{" "}
                          <a
                            href={formData[field.label]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {formData[field.label].split("/").pop()}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="destructive"
          onClick={() => setIsOpen(false)}
          disabled={submittingResponse}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isFormInvalid || submittingResponse}
          className="min-w-[120px]"
        >
          {submittingResponse ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Saving...</span>
            </div>
          ) : (
            "Save Response"
          )}
        </Button>
      </div>
      {/* Debug info for development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify({
                formData,
                isFormInvalid,
                uploading
              }, null, 2)}
            </pre>
          </details>
        </div>
      )} */}
    </div>
  );
}