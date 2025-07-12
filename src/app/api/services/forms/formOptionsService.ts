import { FormOption } from "@/types/form";

// Get the base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Fallback for safety

// Throw error if not configured in production
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in production environment.");
}

/**
 * Fetches form options for a given formId.
 * @param formId The ID of the form.
 * @returns A promise that resolves to an array of FormOption.
 * @throws Error if the network response is not ok.
 */
export const fetchFormOptionsService = async (
  formId: string
): Promise<FormOption[]> => {
  const response = await fetch(`${API_BASE_URL}/api/routes/form/options/${formId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error fetching form options: ${errorData.details || response.statusText}`
    );
  }
  const data = await response.json();
  return data;
};