// src/types/form.ts

import { Dispatch, SetStateAction } from "react";

export interface FormOption {
  id: string; // Ensure this matches your Prisma schema (Int might be an issue if you're using string IDs elsewhere)
  formId: string; // Ensure this matches your Prisma schema (Int might be an issue if you're using string IDs elsewhere)
  label: string;
  type: string;
  options?: string[];
  required: boolean;
}

export interface FormData {
  [key: string]: any;
}

export interface FormResponsePayload {
  formId: string; // Should be string if your frontend uses string IDs for forms
  userId: number;
  values: FormData;
}

export interface Form {
  id: string; // Should be string if your frontend uses string IDs for forms
  name: string;
  details?: string;
  date?: Date | string; // Can be Date object or ISO string
  deletedAt: string | Date | null; // Added for soft delete
}

export interface FormField {
  id: number;
  type: string;
  label: string;
  options?: string[];
  required: boolean;
}

export interface FormResponse {
  id: number; // Keep as number if your Prisma schema defines it as Int
  formId: number; // Keep as number if your Prisma schema defines it as Int
  userId: number;
  values: Record<string, any>;
  createdAt: string | Date; // Can be string or Date
  updatedAt: string | Date; // Can be string or Date
  deletedAt: string | Date | null; // Added for soft delete
  user?: {
    id: number;
    name: string;
    email: string;
  };
  form?: {
    // Add form relation
    id: string;
    name: string;
  };
  imageUpload?: {
    id: number;
    secureUrl: string;
    location?: {
      latitude?: number;
      longitude?: number;
      takenAt?: string; // ISO date string
    };
  };
}

// This interface seems to be for a container that *uses* the table, not the table's props directly.
// You might not need it if you're passing props directly to ResponsesTable.
export interface ResponsesTableProps {
  formId?: string;
  isAdmin?: boolean;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
}

// Extended props for the Responses table component
export interface ExtendedResponsesTableProps {
  responses: FormResponse[];
  paginatedResponses: FormResponse[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  allFieldLabels: string[];
  isAdmin: boolean;
  isDeleting: boolean;
  handleDeleteResponse: (id: number) => Promise<void>;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleViewResponse: (responseId: string) => void;
  handleEditResponse: (responseId: string) => void;
}

// Define the type for the summary data
export interface FormSummary {
  formId: string;
  formName: string;
  formDetails: string;
  responseCount: number;
  lastResponseUser?: string; // Optional: if you want to show the last user who responded
}

export interface FormSummaryTableProps {
  summaryData: FormSummary[];
  loading: boolean;
  error: string | null;
}

// NEW: Props for FormPanel
export interface FormPanelProps {
  setIsOpen: (open: boolean) => void;
  formId?: string | null;
  isReadOnly?: boolean;
  onFormUpdated?: () => void; // Callback for when a form is successfully updated
}

// NEW: Props for useFormBuilder hook
export interface UseFormBuilderProps {
  formId?: string | null; // Optional: ID of the form being edited/viewed
  onFormCreated?: () => void;
  onFormUpdated?: () => void; // Callback for when a form is successfully updated
}

// NEW: Return type for useFormBuilder hook
export interface UseFormBuilderReturn {
  formName: string;
  setFormName: (name: string) => void;
  details: string;
  setDetails: (details: string) => void;
  fields: FormField[];
  handleAddField: () => void;
  handleFieldChange: (id: number, key: keyof FormField, value: any) => void;
  handleRemoveField: (id: number) => void;
  handleOptionChange: (fieldId: number, index: number, value: string) => void;
  addOption: (fieldId: number) => void;
  removeOption: (fieldId: number, index: number) => void;
  handleRequiredChange: (id: number, isRequired: boolean) => void;
  handleCreateForm: () => Promise<void>;
  handleUpdateForm: (formId: string) => Promise<void>; // New: handle update
  fetchFormForEdit: (formId: string) => Promise<void>; // New: fetch form for edit
  creatingForm: boolean;
  updatingForm: boolean; // New: state for updating
  createFormError: string | null;
  updateFormError: string | null; // New: error for updating
  isFormBuilderInvalid: boolean; // New: validation state for save button
  resetFormBuilder: () => void;
}

