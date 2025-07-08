import { FormOption } from "@/types/form";

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