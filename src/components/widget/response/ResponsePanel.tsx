"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useFormResponse } from "@/hooks/form/useFormResponse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ResponsePanelProps {
  formId: string;
  setIsOpen: (open: boolean) => void;
  userId: number;
  onResponseAdded?: () => void;
  responseId?: string | null;
  isReadOnly?: boolean;
}

export default function ResponsePanel({
  formId,
  setIsOpen,
  userId,
  onResponseAdded,
  responseId = null,
  isReadOnly = false,
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
    fetchResponseForEdit,
    handlePermanentDeleteResponse, // ADDED: New function for permanent deletion
    deletingResponse, // ADDED: New state for deletion loading
    errorDeletingResponse, // ADDED: New state for deletion error
  } = useFormResponse({ formId, userId });

  // Fetch response data if responseId is provided
  useEffect(() => {
    if (responseId) {
      fetchResponseForEdit(responseId);
    } else {
      resetForm(); // Reset form if no responseId (i.e., creating a new one)
    }
  }, [responseId, fetchResponseForEdit, resetForm]);

  const onSubmit = async () => {
    console.log("Form submission started...");
    try {
      const success = await handleSubmitResponse(responseId);
      if (success) {
        console.log("Form submitted successfully, showing success toast...");

        toast.success("Success!", {
          description: `Your form has been ${
            responseId ? "updated" : "submitted"
          } successfully.`,
          duration: 3000,
        });

        // Reset form
        resetForm();

        // Close panel after a short delay
        setTimeout(() => {
          setIsOpen(false);
          if (onResponseAdded) {
            onResponseAdded();
          }
        }, 1500);
      } else {
        console.log("Form submission failed");
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

  // ADDED: Function to handle permanent deletion
  const onDelete = async () => {
    if (!responseId) {
      toast.error("Deletion Failed", { description: "No response ID provided for deletion." });
      return;
    }

    // Confirmation dialog (replace with custom modal if preferred)
    if (!confirm("Are you sure you want to permanently delete this response? This action cannot be undone.")) {
      return;
    }

    try {
      const success = await handlePermanentDeleteResponse(Number(responseId));
      if (success) {
        toast.success("Deleted!", {
          description: "The response and its associated data have been permanently deleted.",
          duration: 3000,
        });
        setTimeout(() => {
          setIsOpen(false);
          if (onResponseAdded) { // Trigger refresh if parent component is listening
            onResponseAdded();
          }
        }, 1500);
      } else {
        toast.error("Deletion Failed", {
          description: errorDeletingResponse || "There was an error deleting the response. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error during permanent deletion:", error);
      toast.error("Deletion Failed", {
        description: "An unexpected error occurred during deletion. Please try again.",
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
        <h3 className="text-lg font-semibold text-foreground">
          {isReadOnly
            ? "View Response"
            : responseId
            ? "Edit Response"
            : "New Form Response"}
        </h3>
        <p className="text-sm text-gray-600">
          {isReadOnly
            ? "This response is in read-only mode."
            : "Fill out all required fields. Location data and image metadata will be saved when you submit the form."}
        </p>
      </div>

      {/* Error alert - only show for submission errors */}
      {errorSubmittingResponse && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{errorSubmittingResponse}</AlertDescription>
        </Alert>
      )}

      {/* ADDED: Error alert for deletion errors */}
      {errorDeletingResponse && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Deletion Error</AlertTitle>
          <AlertDescription>{errorDeletingResponse}</AlertDescription>
        </Alert>
      )}

      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label className="text-lg font-semibold text-foreground">
            {field.label}
            {field.required && !isReadOnly && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>

          {field.type === "Text" && (
            <Input
              placeholder={`Enter ${field.label}`}
              value={formData[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          )}

          {field.type === "Date" && (
            <Input
              type="date"
              value={formData[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required={field.required}
              readOnly={isReadOnly}
              disabled={isReadOnly}
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                  <Label className="text-sm">{opt}</Label>
                </div>
              ))}
            </div>
          )}

          {(field.type === "Image Upload" || field.type === "File Upload") && (
            <div>
              {!isReadOnly && (
                <Input
                  type="file"
                  accept={field.type === "Image Upload" ? "image/*" : "*"}
                  onChange={(e) =>
                    handleFileChange(field.label, e.target.files?.[0] || null)
                  }
                  disabled={uploading[field.label]}
                  required={field.required}
                />
              )}
              {uploading[field.label] && (
                <div className="flex items-center gap-2 mt-2">
                  <Spinner />
                  <p className="text-sm text-blue-500">
                    Uploading {field.type.toLowerCase()}...
                  </p>
                </div>
              )}
              {formData[field.label] && typeof formData[field.label] === "string" && (
                <div className="mt-2">
                  {field.type === "Image Upload" ? (
                    <div>
                      <img
                        src={formData[field.label].replace("/upload/", "/upload/f_auto,q_auto/")}
                        alt="Uploaded image"
                        className="max-w-full h-auto max-h-48 object-contain rounded-md"
                      />
                      <div className="mt-2 space-y-1">
                        {!isReadOnly && (
                          <p className="text-xs text-green-600">
                            ✓ Image uploaded successfully. Location data will be
                            extracted and saved when you submit the form.
                          </p>
                        )}
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
        {responseId && !isReadOnly && ( // Only show delete button if editing an existing response and not read-only
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={deletingResponse || submittingResponse}
            className="min-w-[120px]"
          >
            {deletingResponse ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete Permanently"
            )}
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => setIsOpen(false)}
          disabled={submittingResponse || deletingResponse} // Disable if submitting or deleting
        >
          {isReadOnly ? "Close" : "Cancel"}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={onSubmit}
            disabled={isFormInvalid || submittingResponse || deletingResponse} // Disable if deleting as well
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
        )}
      </div>
    </div>
  );
}
