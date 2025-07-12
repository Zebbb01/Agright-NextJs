// src/hooks/form/useFormSubmission.ts
import { useState, useCallback } from "react";
import { submitFormResponseService, updateFormResponseService } from "@/services";
import { FormData, FormResponsePayload, FormOption } from "@/types/form";

interface UseFormSubmissionProps {
  formId: string;
  userId: number;
  formData: FormData;
  fields: FormOption[]; // Needed for resetting form after submission
  isFormInvalid: boolean;
  onSuccess: () => void; // Callback to reset parent form state
}

interface UseFormSubmissionReturn {
  submittingResponse: boolean;
  errorSubmittingResponse: string | null;
  handleSubmitResponse: (responseId?: string | null) => Promise<boolean>;
}

/**
 * useFormSubmission Hook
 *
 * Handles the logic for submitting and updating form responses.
 * Manages submission loading and error states.
 *
 * @param {UseFormSubmissionProps} props - The properties for the hook, including
 * form details, current form data, validation status, and a success callback.
 * @returns {UseFormSubmissionReturn} An object containing submission states,
 * errors, and the submission handler.
 */
export const useFormSubmission = ({
  formId,
  userId,
  formData,
  fields,
  isFormInvalid,
  onSuccess,
}: UseFormSubmissionProps): UseFormSubmissionReturn => {
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [errorSubmittingResponse, setErrorSubmittingResponse] = useState<string | null>(null);

  const handleSubmitResponse = useCallback(async (responseId?: string | null) => {
    if (isFormInvalid) {
      setErrorSubmittingResponse("Please fill out all required fields and wait for any uploads to complete.");
      console.error("Please fill out all required fields and wait for any uploads to complete.");
      return false;
    }

    setSubmittingResponse(true);
    setErrorSubmittingResponse(null);

    // Prepare payload - make sure to include all DbId fields for any uploads
    const payload: FormResponsePayload = {
      formId,
      userId,
      values: {
        ...formData,
        // Explicitly ensure DbId fields are included for file uploads
        ...Object.keys(formData)
          .filter(key => key.endsWith('DbId'))
          .reduce((acc, key) => {
            acc[key] = formData[key];
            return acc;
          }, {} as Record<string, any>)
      },
    };

    console.log("Submitting form response with payload:", payload);
    console.log("DbId fields in payload:", Object.keys(payload.values).filter(key => key.endsWith('DbId')));

    try {
      if (responseId) {
        // If responseId exists, it's an update
        await updateFormResponseService(Number(responseId), payload);
        console.log("Form response updated successfully");
      } else {
        // Otherwise, it's a new submission
        await submitFormResponseService(payload);
        console.log("Form response submitted successfully");
      }

      onSuccess(); // Trigger the success callback in the parent hook
      return true;
    } catch (error: any) {
      console.error("Error creating/updating response:", error);
      setErrorSubmittingResponse(
        error.message || `Failed to ${responseId ? 'update' : 'submit'} response.`
      );
      return false;
    } finally {
      setSubmittingResponse(false);
    }
  }, [formId, userId, formData, isFormInvalid, onSuccess]);

  return {
    submittingResponse,
    errorSubmittingResponse,
    handleSubmitResponse,
  };
};
