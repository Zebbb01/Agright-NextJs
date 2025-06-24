// src/app/api/services/formService.ts
import {
  FormOption,
  FormResponsePayload,
  Form,
  FormField,
  FormResponse,
} from "@/types/form";

/**
 * Fetches form options for a given formId.
 * @param formId The ID of the form.
 * @returns A promise that resolves to an array of FormOption.
 * @throws Error if the network response is not ok.
 */
export const fetchFormOptionsService = async (
  formId: string
): Promise<FormOption[]> => {
  const response = await fetch(`/api/routes/form/options/${formId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error fetching form options: ${errorData.details || response.statusText}`
    );
  }
  const data = await response.json();
  return data;
};

// New service to get a Cloudinary signature
export const getCloudinarySignature = async (
  paramsToSign: Record<string, any>
): Promise<{ signature: string }> => {
  const response = await fetch("/api/routes/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to get Cloudinary signature: ${
        errorData.details || response.statusText
      }`
    );
  }
  return response.json();
};

/**
 * Uploads a file to Cloudinary and saves its details to your backend.
 * @param file The file to upload.
 * @param formResponseValues The current form data to associate with the image.
 * @returns A promise that resolves to the saved ImageUpload record from your DB.
 * @throws Error if the upload fails.
 */
export const uploadFileToCloudinaryService = async (
  file: File,
  formResponseValues?: Record<string, any> // Add formResponseValues parameter
): Promise<{
  id: number;
  publicId: string;
  secureUrl: string;
  exifData?: any;
  takenAt?: string; // Add takenAt to the return type for the hook
}> => {
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary environment variables not set.");
  }

  // Define the parameters for the upload.
  const uploadParams: Record<string, any> = {
    folder: "form_uploads", // Optional: organize your uploads within Cloudinary
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
    timestamp: Math.round(new Date().getTime() / 1000),
  };

  const formData = new FormData();
  formData.append("file", file);
  for (const key in uploadParams) {
    formData.append(key, uploadParams[key]);
  }

  const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const uploadRes = await fetch(cloudinaryUploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    console.error("Cloudinary upload failed:", errorData);
    throw new Error(
      `Cloudinary upload failed: ${
        errorData.error?.message || uploadRes.statusText
      }`
    );
  }

  const cloudinaryData = await uploadRes.json();

  // Now, send the Cloudinary response to your backend to save to Prisma
  const saveToDbRes = await fetch("/api/routes/image-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_id: cloudinaryData.public_id,
      secure_url: cloudinaryData.secure_url,
      format: cloudinaryData.format,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      resource_type: cloudinaryData.resource_type,
      original_filename: cloudinaryData.original_filename,
      exifData: cloudinaryData.image_metadata,
      formResponseValues: formResponseValues, // <--- Pass the form data here
    }),
  });

  if (!saveToDbRes.ok) {
    const errorData = await saveToDbRes.json();
    console.error("Failed to save image upload details to DB:", errorData);
    throw new Error(
      `Failed to save image upload details to database: ${
        errorData.details || saveToDbRes.statusText
      }`
    );
  }

  const savedImageUpload = await saveToDbRes.json();
  // Return the takenAt from the imageUpload as well if available
  return {
    id: savedImageUpload.imageUpload.id,
    publicId: savedImageUpload.imageUpload.publicId,
    secureUrl: savedImageUpload.imageUpload.secureUrl,
    exifData: savedImageUpload.imageUpload.exifData,
    takenAt: savedImageUpload.imageUpload.location?.takenAt, // Assuming location is included if takenAt exists
  };
};

/**
 * Submits a form response.
 * @param payload The form response data.
 * @returns A promise that resolves when the response is successfully created.
 * @throws Error if the response submission fails.
 */
export const submitFormResponseService = async (
  payload: FormResponsePayload
): Promise<void> => {
  // This path corresponds to src/app/api/routes/form/response/route.ts
  const res = await fetch("/api/routes/form/response", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `Failed to create response: ${errorData.details || res.statusText}`
    );
  }
};

/**
 * Fetches a list of all available forms.
 * @returns A promise that resolves to an array of Form.
 * @throws Error if the network response is not ok.
 */
export const fetchFormsService = async (): Promise<Form[]> => {
  const response = await fetch("/api/routes/form");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error fetching forms: ${errorData.details || response.statusText}`
    );
  }
  const data = await response.json();
  return data;
};

/**
 * Fetches a single form by its ID, including its associated options.
 * This service maps the 'options' property from the backend response to 'fields'
 * to match the frontend Form type expectation.
 * @param formId The ID of the form to fetch.
 * @returns A promise that resolves to a Form object with its fields.
 * @throws Error if the form is not found or fetching fails.
 */
export const fetchFormByIdService = async (formId: string): Promise<Form & { fields: FormOption[] }> => {
  const response = await fetch(`/api/routes/form/${formId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error fetching form: ${errorData.details || response.statusText}`
    );
  }
  const data = await response.json();

  // Explicitly map 'options' from the backend response to 'fields' for the frontend type
  const formWithFields: Form & { fields: FormOption[] } = {
    ...data,
    fields: data.options || [], // Ensure it's an array, even if empty
  };

  // Optionally delete the 'options' property if the frontend only expects 'fields'
  delete (formWithFields as any).options; // Cast to any to allow deleting property

  return formWithFields;
};


/**
 * Creates a new form and its associated form options.
 * @param formDetails The details of the form to create (name, details, date).
 * @param fields The array of form fields to associate with the new form.
 * @returns A promise that resolves when the form and its options are successfully created.
 * @throws Error if either the form creation or option creation fails.
 */
export const createFormAndOptionsService = async (
  formDetails: Omit<Form, "id">, // Omit 'id' as it's generated by the backend
  fields: FormField[]
): Promise<void> => {
  // Step 1: Create the form
  // This path corresponds to src/app/api/routes/form/route.ts
  const formRes = await fetch("/api/routes/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formDetails),
  });

  if (!formRes.ok) {
    const errorData = await formRes.json();
    throw new Error(
      `Failed to create form: ${errorData.details || formRes.statusText}`
    );
  }
  const createdForm = await formRes.json();
  const formId = createdForm.id; // Assuming the created form returns its ID

  // Step 2: Create form options
  // This path corresponds to src/app/api/routes/form/options/route.ts
  const optionPromises = fields.map((field) =>
    fetch("/api/routes/form/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formId: formId,
        label: field.label,
        type: field.type,
        options: field.options || [],
        required: field.required,
      }),
    })
  );

  const optionResponses = await Promise.all(optionPromises);

  for (const res of optionResponses) {
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Failed to create form option: ${errorData.details || res.statusText}`
      );
    }
  }
};

/**
 * Updates an existing form and its associated form options.
 * @param formId The ID of the form to update.
 * @param formDetails The updated details of the form (name, details).
 * @param fields The updated array of form fields.
 * @returns A promise that resolves when the form and its options are successfully updated.
 * @throws Error if the update fails.
 */
export const updateFormAndOptionsService = async (
  formId: string,
  formDetails: Partial<Omit<Form, "id" | "deletedAt">>, // Allow partial update for form details
  fields: FormField[] // All fields will be sent for update
): Promise<void> => {
  const res = await fetch(`/api/routes/form/${formId}`, {
    method: "PUT", // Or PATCH depending on your backend API design
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formDetails, fields }), // Send both form details and fields
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `Failed to update form: ${errorData.details || res.statusText}`
    );
  }
};


/**
 * Soft deletes a form by its ID (moves it to archive).
 * @param formId The ID of the form to soft delete.
 * @returns A promise that resolves when the form is successfully soft deleted.
 * @throws Error if the soft deletion fails.
 */
export const deleteFormService = async (formId: string): Promise<void> => {
  // This now calls the PATCH endpoint with action: "soft-delete"
  const res = await fetch(`/api/routes/form/${formId}`, {
    method: "PATCH", // Changed to PATCH
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "soft-delete" }), // Added action payload
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let errorMessage = `Failed to soft delete form: ${res.statusText}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = `Failed to soft delete form: ${
        errorJson.details || errorJson.error || res.statusText
      }`;
    } catch (parseError) {
      errorMessage = `Failed to soft delete form: ${res.statusText}. Server response: ${errorBody}`;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Fetches form responses. Can fetch all responses or responses for a specific form.
 * @param formId Optional. The ID of the form to fetch responses for. If not provided, fetches all responses.
 * @returns A promise that resolves to an array of FormResponse.
 * @throws Error if fetching responses fails.
 */
export const fetchFormResponsesService = async (
  formId?: string
): Promise<FormResponse[]> => {
  let url = `/api/routes/form/response`;
  if (formId) {
    url = `/api/routes/form/response/by-form/${formId}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `Error fetching responses: ${errorData.details || res.statusText}`
    );
  }
  const data = await res.json();
  return data;
};

/**
 * Fetches a single form response by its ID.
 * @param responseId The ID of the form response to fetch.
 * @returns A promise that resolves to a FormResponse object.
 * @throws Error if the response is not found or fetching fails.
 */
export const fetchFormResponseService = async (
  responseId: number
): Promise<FormResponse> => {
  const response = await fetch(`/api/routes/form/response/${responseId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error fetching response: ${errorData.details || response.statusText}`
    );
  }
  const data = await response.json();
  return data;
};

/**
 * Updates an existing form response.
 * @param responseId The ID of the response to update.
 * @param payload The updated form response data (values and optionally imageUploadId, userId).
 * @returns A promise that resolves when the response is successfully updated.
 * @throws Error if the response update fails.
 */
export const updateFormResponseService = async (
  responseId: number,
  payload: Partial<FormResponsePayload> // Use Partial as not all fields might be updated
): Promise<void> => {
  const res = await fetch(`/api/routes/form/response/${responseId}`, {
    method: "PATCH", // Use PATCH for partial updates
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `Failed to update response: ${errorData.details || res.statusText}`
    );
  }
};

/**
 * Soft deletes a form response by its ID (moves it to archive).
 * @param responseId The ID of the form response to soft delete.
 * @returns A promise that resolves when the response is successfully soft deleted.
 * @throws Error if the soft deletion fails.
 */
export const deleteFormResponseService = async (
  responseId: number
): Promise<void> => {
  // This now calls the PATCH endpoint with action: "soft-delete" for soft deletion
  const res = await fetch(`/api/routes/form/response/${responseId}`, {
    method: "PATCH", // Changed to PATCH
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "soft-delete" }), // Added action payload
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let errorMessage = `Failed to soft delete response: ${res.statusText}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = `Failed to soft delete response: ${
        errorJson.details || errorJson.error || res.statusText
      }`;
    } catch (parseError) {
      errorMessage = `Failed to soft delete response: ${res.statusText}. Server response: ${errorBody}`;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Permanently deletes a form response by its ID, along with associated ImageUpload and Location
 * if no other records reference them.
 * @param responseId The ID of the form response to permanently delete.
 * @returns A promise that resolves when the response and associated data are successfully deleted.
 * @throws Error if the permanent deletion fails.
 */
export const permanentlyDeleteFormResponseService = async (
  responseId: number
): Promise<void> => {
  // This calls the DELETE endpoint for permanent deletion
  const res = await fetch(`/api/routes/form/response/${responseId}`, {
    method: "DELETE", // Use DELETE for permanent deletion
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let errorMessage = `Failed to permanently delete response: ${res.statusText}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = `Failed to permanently delete response: ${
        errorJson.details || errorJson.error || res.statusText
      }`;
    } catch (parseError) {
      errorMessage = `Failed to permanently delete response: ${res.statusText}. Server response: ${errorBody}`;
    }
    throw new Error(errorMessage);
  }
};
