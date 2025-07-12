import { Form, FormResponse } from "@/types/form";

// Get the base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Fallback for safety

// Throw error if not configured in production
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in production environment.");
}

/**
 * Fetches all archived forms.
 * @returns A promise that resolves to an array of archived forms.
 * @throws An error if the API call fails.
 */
export async function getArchivedForms(): Promise<Form[]> {
  const res = await fetch(`${API_BASE_URL}/api/routes/form/archive`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch archived forms");
  }
  return res.json();
}

/**
 * Fetches all archived form responses.
 * @returns A promise that resolves to an array of archived form responses.
 * @throws An error if the API call fails.
 */
export async function getArchivedResponses(): Promise<FormResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/routes/form/response/archive`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch archived responses");
  }
  return res.json();
}

/**
 * Restores a form from the archive.
 * @param formId The ID of the form to restore.
 * @throws An error if the API call fails.
*/
export async function restoreForm(formId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/routes/form/${formId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "restore" }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to restore form");
  }
}

/**
 * Permanently deletes a form.
 * @param formId The ID of the form to delete permanently.
 * @throws An error if the API call fails.
 */
export async function permanentDeleteForm(formId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/routes/form/${formId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to permanently delete form");
  }
}

/**
 * Restores a form response from the archive.
 * @param responseId The ID of the response to restore.
 * @throws An error if the API call fails.
 */
export async function restoreResponse(responseId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/routes/form/response/${responseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "restore" }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to restore response");
  }
}

/**
 * Permanently deletes a form response.
 * @param responseId The ID of the response to delete permanently.
 * @throws An error if the API call fails.
 */
export async function permanentDeleteResponse(responseId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/routes/form/response/${responseId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to permanently delete response");
  }
}