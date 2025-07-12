// src/app/api/services/forms/formsService.ts
import { Form, FormField, FormOption } from "@/types/form";

// Get the base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Fallback for safety

// Throw error if not configured in production
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in production environment.");
}

/**
 * Fetches a list of all available forms.
 * @returns A promise that resolves to an array of Form.
 * @throws Error if the network response is not ok.
 */
export const fetchFormsService = async (): Promise<Form[]> => {
  // Use absolute URL
  const response = await fetch(`${API_BASE_URL}/api/routes/form`);
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
export const fetchFormByIdService = async (
  formId: string
): Promise<Form & { fields: FormOption[] }> => {
  // Use absolute URL
  const response = await fetch(`${API_BASE_URL}/api/routes/form/${formId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error fetching form: ${errorData.details || response.statusText}`
    );
  }
  const data = await response.json();

  const formWithFields: Form & { fields: FormOption[] } = {
    ...data,
    fields: data.options || [],
  };

  delete (formWithFields as any).options;

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
  formDetails: Omit<Form, "id">,
  fields: FormField[]
): Promise<void> => {
  // Use absolute URL
  const formRes = await fetch(`${API_BASE_URL}/api/routes/form`, {
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
  const formId = createdForm.id;

  const optionPromises = fields.map((field) =>
    // Use absolute URL
    fetch(`${API_BASE_URL}/api/routes/form/options`, {
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
  formDetails: Partial<Omit<Form, "id" | "deletedAt">>,
  fields: FormField[]
): Promise<void> => {
  // Use absolute URL
  const res = await fetch(`${API_BASE_URL}/api/routes/form/${formId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formDetails, fields }),
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
  // Use absolute URL
  const res = await fetch(`${API_BASE_URL}/api/routes/form/${formId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "soft-delete" }),
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