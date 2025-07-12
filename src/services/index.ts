// src/services/index.ts

// Existing imports remain the same, assuming they are client-side safe fetches or import
// from server-side modules that are then called by API routes.
export { fetchFormOptionsService } from "@/app/api/services/forms/formOptionsService";
export {
  submitFormResponseService,
  fetchFormResponsesService,
  fetchFormResponseService,
  updateFormResponseService,
  deleteFormResponseService,
  permanentlyDeleteFormResponseService,
} from "@/app/api/services/forms/formResponsesService";
export {
  fetchFormsService,
  fetchFormByIdService,
  createFormAndOptionsService,
  updateFormAndOptionsService,
  deleteFormService,
} from "@/app/api/services/forms/formsService";

// Cloudinary Services (assuming these are client-side friendly or call API routes)
export {
  getCloudinarySignature,
  uploadFileToCloudinaryService,
} from "@/app/api/services/cloudinary/cloudinaryService";

// Archive Services (assuming these are client-side friendly or call API routes)
export {
  getArchivedForms,
  getArchivedResponses,
  restoreForm,
  permanentDeleteForm,
  restoreResponse,
  permanentDeleteResponse,
} from "@/app/api/services/archive/archiveService";

// Auth Services (assuming these are client-side friendly or call API routes)
export {
  fetchRoles,
  createRole,
  updateRole,
  deleteRoleById,
} from "@/app/api/services/auth/roleService";
export {
  fetchUsersAndRoles,
  deleteUserById,
  createUser,
  updateUser,
} from "@/app/api/services/auth/userService";

// Map Services (assuming these are client-side friendly or call API routes)
export {
  getAllLocationsWithImages,
  getLocationByIdWithImages,
} from "@/app/api/services/maps/mapService";

// --- START NEW/MODIFIED SECTION ---
import { FormBlockData, FormSummary, FormResponse } from "@/types/form";

// Redefine fetchFormDetailsAndResponsesForBlocksService to call the API route
export async function fetchFormDetailsAndResponsesForBlocksService(formId: number): Promise<FormBlockData> {
  const res = await fetch(`/api/routes/form/block-summary/${formId}`); // Calls your API route

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Failed to fetch block summary for form ID: ${formId}`);
  }
  return res.json();
}

// Ensure fetchFormsService also calls an API route if it's currently using Prisma directly.
// If your existing fetchFormsService is already calling an API route, no change is needed here.
// I'm providing a placeholder that *assumes* it's calling an API route.
// If not, you need to adjust it similarly to fetchFormDetailsAndResponsesForBlocksService.
// For example:
/*
// Assuming your existing fetchFormsService might be server-side.
// If it's used in client components, it MUST call an API route.
export async function fetchFormsService(): Promise<FormSummary[]> {
  const res = await fetch('/api/forms'); // Example API route for fetching forms
  if (!res.ok) {
    throw new Error('Failed to fetch forms');
  }
  return res.json();
}
*/
// --- END NEW/MODIFIED SECTION ---