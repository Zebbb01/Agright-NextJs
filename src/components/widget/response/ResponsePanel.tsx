// src/components/widget/response/ResponsePanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormResponse } from "@/hooks/response/useFormResponse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useEffect } from "react";
// Import the new ResponseFormFields component
import ResponseFormFields from "./ResponseFormFields";
// Ensure FormField and FormData types are accessible, e.g., from a shared types file
// import { FormField, FormData } from "@/types/form";

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
    handlePermanentDeleteResponse,
    deletingResponse,
    errorDeletingResponse,
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

  // Function to handle permanent deletion
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

      {/* Error alert for deletion errors */}
      {errorDeletingResponse && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Deletion Error</AlertTitle>
          <AlertDescription>{errorDeletingResponse}</AlertDescription>
        </Alert>
      )}

      {/* Render the nested form fields component */}
      <ResponseFormFields
        fields={fields.map((field: any) => ({
          ...field,
          id: typeof field.id === "string" ? Number(field.id) : field.id,
        }))}
        formData={formData}
        handleChange={handleChange}
        handleCheckboxChange={handleCheckboxChange}
        handleFileChange={handleFileChange}
        uploading={uploading}
        getImageTakenDate={getImageTakenDate}
        isReadOnly={isReadOnly}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="destructive"
          onClick={() => setIsOpen(false)}
          disabled={submittingResponse || deletingResponse}
        >
          {isReadOnly ? "Close" : "Cancel"}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={onSubmit}
            disabled={isFormInvalid || submittingResponse || deletingResponse}
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