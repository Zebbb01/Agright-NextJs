// src/hooks/form/useFormEditing.ts
import { useState, useCallback } from "react";
import { fetchFormResponseService } from "@/services";
import { FormData, FormOption } from "@/types/form";

interface UseFormEditingProps {
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setImageTakenDates: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  fields: FormOption[]; // Needed to correctly process image uploads from existing response
}

interface UseFormEditingReturn {
  loadingInitialResponse: boolean;
  errorLoadingInitialResponse: string | null;
  fetchResponseForEdit: (responseId: string) => Promise<void>;
}

/**
 * useFormEditing Hook
 *
 * Manages the fetching of an existing form response for editing purposes.
 * It populates the form data and image metadata from the fetched response.
 *
 * @param {UseFormEditingProps} props - The properties for the hook, including
 * setters for form data, image taken dates, and the current form fields.
 * @returns {UseFormEditingReturn} An object containing loading/error states
 * for initial response fetching, and the fetch function.
 */
export const useFormEditing = ({
  setFormData,
  setImageTakenDates,
  fields,
}: UseFormEditingProps): UseFormEditingReturn => {
  const [loadingInitialResponse, setLoadingInitialResponse] = useState(false);
  const [errorLoadingInitialResponse, setErrorLoadingInitialResponse] = useState<string | null>(null);

  const fetchResponseForEdit = useCallback(async (responseId: string) => {
    setLoadingInitialResponse(true);
    setErrorLoadingInitialResponse(null);
    try {
      const existingResponse = await fetchFormResponseService(Number(responseId));
      const loadedFormData: FormData = {};
      const loadedImageTakenDates: Record<string, string> = {};

      // Populate form data from existing response values
      for (const key in existingResponse.values) {
        loadedFormData[key] = existingResponse.values[key];
      }

      // Handle image uploads and their associated data (URL, DbId, takenAt)
      // Ensure fields are loaded before trying to process them here
      if (fields.length > 0) {
        fields.forEach(field => {
          if ((field.type === "Image Upload" || field.type === "File Upload") && existingResponse.imageUpload) {
            // Assuming your `values` JSON for an image upload field directly stores the URL
            // And you have a convention for storing the imageUploadId, e.g., `${label}DbId`
            if (existingResponse.imageUpload.secureUrl) {
              loadedFormData[field.label] = existingResponse.imageUpload.secureUrl;
            }
            if (existingResponse.imageUpload.id) {
              loadedFormData[`${field.label}DbId`] = existingResponse.imageUpload.id;
            }
            if (existingResponse.imageUpload.location?.takenAt) {
              loadedImageTakenDates[field.label] = existingResponse.imageUpload.location.takenAt;
            }
          }
        });
      }

      setFormData(loadedFormData);
      setImageTakenDates(loadedImageTakenDates);
    } catch (error: any) {
      console.error("Failed to load initial response data:", error);
      setErrorLoadingInitialResponse(error.message || "Failed to load response data for editing.");
    } finally {
      setLoadingInitialResponse(false);
    }
  }, [fields, setFormData, setImageTakenDates]); // Depend on 'fields' as it's used to process image uploads

  return {
    loadingInitialResponse,
    errorLoadingInitialResponse,
    fetchResponseForEdit,
  };
};
