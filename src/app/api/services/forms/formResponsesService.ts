import { FormResponsePayload, FormResponse } from "@/types/form";

/**
 * Submits a form response.
 * @param payload The form response data.
 * @returns A promise that resolves when the response is successfully created.
 * @throws Error if the response submission fails.
 */
export const submitFormResponseService = async (
  payload: FormResponsePayload
): Promise<void> => {
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
  const res = await fetch(`/api/routes/form/response/${responseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "soft-delete" }),
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
  const res = await fetch(`/api/routes/form/response/${responseId}`, {
    method: "DELETE",
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