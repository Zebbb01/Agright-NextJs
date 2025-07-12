// src/hooks/form/useFormFileUpload.ts
import { useState, useCallback } from "react";
import { uploadFileToCloudinaryService } from "@/services";
import { FileUploadResult, FormData } from "@/types/form";

interface UseFormFileUploadProps {
  handleChange: (label: string, value: any) => void;
  formData: FormData;
}

interface UseFormFileUploadReturn {
  uploading: Record<string, boolean>;
  imageTakenDates: Record<string, string>;
  handleFileChange: (label: string, file: File | null) => Promise<void>;
  getImageTakenDate: (label: string) => string | null;
  resetFileUploadState: () => void;
  setImageTakenDates: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

/**
 * useFormFileUpload Hook
 *
 * Manages the state and logic for file and image uploads within a form.
 * Handles upload status, stores image metadata (like 'takenAt' date),
 * and integrates with a file upload service.
 *
 * @param {UseFormFileUploadProps} props - The properties for the hook, including
 * a `handleChange` function to update the main form data and the current `formData`.
 * @returns {UseFormFileUploadReturn} An object containing upload states, handlers,
 * and image metadata functions.
 */
export const useFormFileUpload = ({
  handleChange,
  formData, // Needed to pass context to upload service (e.g., existing data)
}: UseFormFileUploadProps): UseFormFileUploadReturn => {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [imageTakenDates, setImageTakenDates] = useState<Record<string, string>>({});

  // Handles file selection and initiates upload to Cloudinary
  const handleFileChange = useCallback(
    async (label: string, file: File | null) => {
      // If no file is selected (e.g., clearing the input), reset related form data and states
      if (!file) {
        handleChange(label, null);
        handleChange(`${label}DbId`, null); // Clear associated DB ID
        handleChange(`${label}OriginalFilename`, null); // <<< ADDED: Clear original filename
        setImageTakenDates((prev) => {
          const updated = { ...prev };
          delete updated[label];
          return updated;
        });
        return;
      }

      setUploading((prev) => ({ ...prev, [label]: true })); // Set uploading status for this field
      try {
        // Upload the file and get the result, including secure URL, ID, and takenAt date
        const result: FileUploadResult = await uploadFileToCloudinaryService(file, formData);
        handleChange(label, result.secureUrl); // Update form data with the secure URL
        handleChange(`${label}DbId`, result.id); // Store the DB ID of the saved ImageUpload record

        // If an original filename is returned, store it
        if (result.originalFilename) {
          handleChange(`${label}OriginalFilename`, result.originalFilename); // <<< ADDED
        }

        // If a 'takenAt' date is returned from EXIF data, store it
        if (result.takenAt) {
          setImageTakenDates((prev) => ({
            ...prev,
            [label]: result.takenAt!,
          }));
        }

        console.log("File uploaded successfully, ImageUpload ID:", result.id);
        if (result.originalFilename) {
          console.log("Original filename extracted:", result.originalFilename); // <<< ADDED
        }
        if (result.takenAt) {
          console.log("Image taken date extracted:", result.takenAt);
        }
        console.log("Current form data context passed to upload:", formData);
      } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        handleChange(label, null); // Clear form data on error
        handleChange(`${label}DbId`, null); // Clear associated DB ID on error
        handleChange(`${label}OriginalFilename`, null); // <<< ADDED: Clear original filename on error
        setImageTakenDates((prev) => {
          const updated = { ...prev };
          delete updated[label];
          return updated;
        });
        console.error(`Failed to upload file for ${label}. Please try again.`);
      } finally {
        setUploading((prev) => ({ ...prev, [label]: false })); // Reset uploading status
      }
    },
    [handleChange, formData]
  );

  // Provides a formatted 'takenAt' date for display
  const getImageTakenDate = useCallback((label: string): string | null => {
    const takenAt = imageTakenDates[label];
    if (!takenAt) return null;

    try {
      const date = new Date(takenAt);
      return date.toLocaleString(); // Format date for display
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  }, [imageTakenDates]);

  // Resets all file upload-related states
  const resetFileUploadState = useCallback(() => {
    setUploading({});
    setImageTakenDates({});
  }, []);

  return {
    uploading,
    imageTakenDates,
    handleFileChange,
    getImageTakenDate,
    resetFileUploadState,
    setImageTakenDates, // Expose setter for loading existing data during edit
  };
};
