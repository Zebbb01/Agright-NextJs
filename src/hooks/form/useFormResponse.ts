// src/hooks/form/useFormResponse.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { FormOption, FormData, FormResponsePayload, FormResponse } from "@/types/form";
import {
  fetchFormOptionsService,
  uploadFileToCloudinaryService,
  submitFormResponseService,
  updateFormResponseService, // Import the new service
  fetchFormResponseService, // Import the new service
} from "@/app/api/services/formService";

interface UseFormResponseProps {
  formId: string;
  userId: number;
  responseId?: number; // Optional: If provided, indicates we are editing an existing response
}

interface FileUploadResult {
  secureUrl: string;
  id: number;
  takenAt?: string; // ISO date string from EXIF data
}

interface UseFormResponseReturn {
  formData: FormData;
  fields: FormOption[];
  uploading: Record<string, boolean>;
  loadingFields: boolean;
  errorFetchingFields: string | null;
  submittingResponse: boolean;
  errorSubmittingResponse: string | null;
  handleChange: (label: string, value: any) => void;
  handleCheckboxChange: (label: string, value: string) => void;
  handleFileChange: (label: string, file: File | null) => Promise<void>;
  handleSubmitResponse: (responseId?: string | null) => Promise<boolean>; // Updated signature
  resetForm: () => void;
  isFormInvalid: boolean;
  getImageTakenDate: (label: string) => string | null;
  loadingInitialResponse: boolean; // New state for loading initial response
  errorLoadingInitialResponse: string | null; // New state for initial response error
  fetchResponseForEdit: (responseId: string) => Promise<void>; // ADD THIS LINE: Declare the new function
}

export const useFormResponse = ({
  formId,
  userId,
}: UseFormResponseProps): UseFormResponseReturn => {
  const [formData, setFormData] = useState<FormData>({});
  const [fields, setFields] = useState<FormOption[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [imageTakenDates, setImageTakenDates] = useState<Record<string, string>>({});
  const [loadingFields, setLoadingFields] = useState(true);
  const [errorFetchingFields, setErrorFetchingFields] = useState<string | null>(
    null
  );
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [errorSubmittingResponse, setErrorSubmittingResponse] = useState<
    string | null
  >(null);
  const [loadingInitialResponse, setLoadingInitialResponse] = useState(false); // New state
  const [errorLoadingInitialResponse, setErrorLoadingInitialResponse] = useState<string | null>(null); // New state

  // useCallback for fetchResponseForEdit to make it stable
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
      if (fields.length > 0) { // Add this check
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
  }, [fields]); // Depend on 'fields' because it's used inside to process image uploads


  // Fetch form options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingFields(true);
      setErrorFetchingFields(null);
      try {
        const data = await fetchFormOptionsService(formId);
        setFields(data);
         const initialFormData: FormData = {};
         data.forEach((field) => {
           if (field.type === "Checkbox") {
             initialFormData[field.label] = [];
           } else if (
             field.type === "Image Upload" ||
             field.type === "File Upload"
           ) {
             initialFormData[field.label] = null;
             initialFormData[`${field.label}DbId`] = null;
           } else {
             initialFormData[field.label] = "";
           }
         });
         setFormData(initialFormData);

      } catch (error: any) {
        console.error("Failed to fetch form options:", error);
        setErrorFetchingFields(error.message || "Failed to load form fields.");
      } finally {
        setLoadingFields(false);
      }
    };

    if (formId) {
      fetchOptions();
    }
  }, [formId]);

  const handleChange = useCallback((label: string, value: any) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  }, []);

  const handleCheckboxChange = useCallback(
    (label: string, value: string) => {
      const existing: string[] = formData[label] || [];
      handleChange(
        label,
        existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value]
      );
    },
    [formData, handleChange]
  );

  // Updated handleFileChange to capture and store takenAt date
  const handleFileChange = useCallback(
    async (label: string, file: File | null) => {
      if (!file) {
        handleChange(label, null);
        handleChange(`${label}DbId`, null); // Clear associated DB ID
        setImageTakenDates((prev) => {
          const updated = { ...prev };
          delete updated[label];
          return updated;
        });
        return;
      }

      setUploading((prev) => ({ ...prev, [label]: true }));
      try {
        // Pass current form data to the upload service for context
        const result: FileUploadResult = await uploadFileToCloudinaryService(file, formData);
        handleChange(label, result.secureUrl);
        handleChange(`${label}DbId`, result.id); // Store the DB ID of the saved ImageUpload record

        // Store the takenAt date if available
        if (result.takenAt) {
          setImageTakenDates((prev) => ({
            ...prev,
            [label]: result.takenAt!
          }));
        }

        console.log("File uploaded successfully, ImageUpload ID:", result.id);
        if (result.takenAt) {
          console.log("Image taken date extracted:", result.takenAt);
        }
        console.log("Current form data context:", formData);
      } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        handleChange(label, null);
        handleChange(`${label}DbId`, null); // Clear associated DB ID on error
        setImageTakenDates((prev) => {
          const updated = { ...prev };
          delete updated[label];
          return updated;
        });
        alert(`Failed to upload file for ${label}. Please try again.`);
      } finally {
        setUploading((prev) => ({ ...prev, [label]: false }));
      }
    },
    [handleChange, formData]
  );

  // Function to get formatted taken date for an image
  const getImageTakenDate = useCallback((label: string): string | null => {
    const takenAt = imageTakenDates[label];
    if (!takenAt) return null;

    try {
      const date = new Date(takenAt);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  }, [imageTakenDates]);

  // Memoized validation logic for the form
  const isFormInvalid = useMemo(() => {
    // If fields haven't loaded yet, consider it invalid for disabling purposes
    if (loadingFields || fields.length === 0 || loadingInitialResponse) return true;

    // Check if any required field is empty or if any file uploads are in progress
    for (const field of fields) {
      if (field.required) {
        const value = formData[field.label];
        let isEmpty = false;

        if (field.type === "Checkbox") {
          isEmpty = !Array.isArray(value) || value.length === 0;
        } else if (
          field.type === "Image Upload" ||
          field.type === "File Upload"
        ) {
          // For file uploads, ensure a string (URL) exists and is not empty
          isEmpty = typeof value !== "string" || value.trim() === "";
        } else {
          // Check for null, undefined, or empty string (after trimming)
          isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "");
        }

        if (isEmpty) {
          return true; // Found an empty required field
        }
      }
      // Also check if any file upload for this field is still in progress
      if (uploading[field.label]) {
        return true;
      }
    }

    return false; // If no empty required fields and no uploads in progress, the form is valid
  }, [formData, fields, loadingFields, uploading, loadingInitialResponse]);

  // Handle form submission - now creates Location with complete data including takenAt
  const handleSubmitResponse = useCallback(async (responseId?: string | null) => { // Updated signature
    // We can now directly use isFormInvalid here for an initial check
    if (isFormInvalid) {
      setErrorSubmittingResponse("Please fill out all required fields and wait for any uploads to complete.");
      alert("Please fill out all required fields and wait for any uploads to complete.");
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
        // Explicitly ensure DbId fields are included
        ...Object.keys(formData)
          .filter(key => key.endsWith('DbId'))
          .reduce((acc, key) => {
            acc[key] = formData[key];
            return acc;
          }, {} as Record<string, any>)
      },
    };

    // Log the payload to help with debugging
    console.log("Submitting form response with payload:", payload);
    console.log("DbId fields in payload:", Object.keys(payload.values).filter(key => key.endsWith('DbId')));
    console.log("Image taken dates:", imageTakenDates);

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

      // Reset form data after successful submission or update (if new)
      if (!responseId) { // Only reset if it's a new form submission
        const initialFormData: FormData = {};
        fields.forEach((field) => {
          if (field.type === "Checkbox") {
            initialFormData[field.label] = [];
          } else if (
            field.type === "Image Upload" ||
            field.type === "File Upload"
          ) {
            initialFormData[field.label] = null;
            initialFormData[`${field.label}DbId`] = null;
          } else {
            initialFormData[field.label] = "";
          }
        });
        setFormData(initialFormData);
      }
      setUploading({}); // Clear any pending upload statuses
      setImageTakenDates({}); // Clear taken dates
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
  }, [formId, userId, formData, isFormInvalid, fields, imageTakenDates]); // Removed responseId from dependency array for handleSubmitResponse


  const resetForm = useCallback(() => {
    setFormData({});
    setUploading({});
    setImageTakenDates({});
    setErrorSubmittingResponse(null);
    if (fields.length > 0) {
      const initialFormData: FormData = {};
      fields.forEach((field) => {
        if (field.type === "Checkbox") {
          initialFormData[field.label] = [];
        } else if (
          field.type === "Image Upload" ||
          field.type === "File Upload"
        ) {
          initialFormData[field.label] = null;
          initialFormData[`${field.label}DbId`] = null;
        } else {
          initialFormData[field.label] = "";
        }
      });
      setFormData(initialFormData);
    }
  }, [fields]);

  return {
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
    loadingInitialResponse, // Return new state
    errorLoadingInitialResponse, // Return new state
    fetchResponseForEdit, // ADD THIS LINE: Return the new function
  };
};