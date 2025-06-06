// src/hooks/form/useFormResponse.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { FormOption, FormData, FormResponsePayload } from "@/types/form";
import {
  fetchFormOptionsService,
  uploadFileToCloudinaryService,
  submitFormResponseService,
} from "@/app/api/services/formService";

interface UseFormResponseProps {
  formId: string;
  userId: number;
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
  handleSubmitResponse: () => Promise<boolean>;
  resetForm: () => void;
  isFormInvalid: boolean;
  getImageTakenDate: (label: string) => string | null;
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

  // Fetch form options (including the 'required' property)
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
            // Initialize the DbId field as well
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
    if (loadingFields || fields.length === 0) return true;

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
  }, [formData, fields, loadingFields, uploading]);

  // Handle form submission - now creates Location with complete data including takenAt
  const handleSubmitResponse = useCallback(async () => {
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
      await submitFormResponseService(payload);
      console.log("Form response submitted successfully");
      
      // Reset form data after successful submission
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
      setUploading({}); // Clear any pending upload statuses
      setImageTakenDates({}); // Clear taken dates
      return true;
    } catch (error: any) {
      console.error("Error creating response:", error);
      setErrorSubmittingResponse(
        error.message || "Failed to submit response."
      );
      return false;
    } finally {
      setSubmittingResponse(false);
    }
  }, [formId, userId, formData, isFormInvalid, fields, imageTakenDates]);

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
  };
};