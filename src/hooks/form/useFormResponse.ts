// src/hooks/form/useFormResponse.ts
import { useState, useEffect, useCallback } from "react";
import { FormOption, FormData, FormResponsePayload } from "@/types/form";
import {
  fetchFormOptionsService,
  uploadFileToCloudinaryService, // Changed import
  submitFormResponseService,
} from "@/app/api/services/formService";

interface UseFormResponseProps {
  formId: string;
  userId: number;
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
}

export const useFormResponse = ({
  formId,
  userId,
}: UseFormResponseProps): UseFormResponseReturn => {
  const [formData, setFormData] = useState<FormData>({});
  const [fields, setFields] = useState<FormOption[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [loadingFields, setLoadingFields] = useState(true);
  const [errorFetchingFields, setErrorFetchingFields] = useState<string | null>(
    null
  );
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [errorSubmittingResponse, setErrorSubmittingResponse] = useState<
    string | null
  >(null);

  // Fetch form options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingFields(true);
      setErrorFetchingFields(null);
      try {
        const data = await fetchFormOptionsService(formId);
        setFields(data);
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

  // Handle general input changes (Text, Date, Radio)
  const handleChange = useCallback((label: string, value: any) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  }, []);

  // Handle checkbox changes
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

  // Handle file uploads to Cloudinary
  const handleFileChange = useCallback(
    async (label: string, file: File | null) => {
      if (!file) {
        // Clear the URL and the DB ID if the file is removed
        handleChange(label, null);
        handleChange(`${label}DbId`, null);
        return;
      }

      setUploading((prev) => ({ ...prev, [label]: true }));
      try {
        // Upload to Cloudinary and save details to your DB
        const result = await uploadFileToCloudinaryService(file);
        // Store the Cloudinary URL in formData for display/reference
        handleChange(label, result.secureUrl);
        // Store the database ID of the ImageUpload record for linking to Response
        handleChange(`${label}DbId`, result.id);
      } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        handleChange(label, null);
        handleChange(`${label}DbId`, null);
        alert(`Failed to upload file for ${label}. Please try again.`);
      } finally {
        setUploading((prev) => ({ ...prev, [label]: false }));
      }
    },
    [handleChange]
  );

  // Handle form submission
  const handleSubmitResponse = useCallback(async () => {
    const isAnyUploading = Object.values(uploading).some(
      (status) => status === true
    );
    if (isAnyUploading) {
      alert("Please wait for all file uploads to complete.");
      return false;
    }

    setSubmittingResponse(true);
    setErrorSubmittingResponse(null);

    // Prepare the payload for the form response
    const payload: FormResponsePayload = {
      formId,
      userId,
      values: formData, // formData now includes image URLs and potentially imageUploadDbId
    };

    try {
      await submitFormResponseService(payload);
      setFormData({}); // Clear form on successful submission
      return true; // Indicate success
    } catch (error: any) {
      console.error("Error creating response:", error);
      setErrorSubmittingResponse(
        error.message || "Failed to submit response."
      );
      return false; // Indicate failure
    } finally {
      setSubmittingResponse(false);
    }
  }, [formId, userId, formData, uploading]);

  const resetForm = useCallback(() => {
    setFormData({});
    setUploading({});
    setErrorSubmittingResponse(null);
  }, []);

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
  };
};