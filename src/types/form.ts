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
  date?: Date;
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  // Add imageUpload to the FormResponse interface based on your Prisma schema
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

// Extended props for the table component
export interface ExtendedResponsesTableProps {
  responses: FormResponse[];
  paginatedResponses: FormResponse[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  allFieldLabels: string[];
  isAdmin: boolean;
  handleDeleteResponse: (id: number) => Promise<void>; // Changed type to match the hook
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleViewResponse: (responseId: string) => void; // ADDED THIS LINE
  handleEditResponse: (responseId: string) => void; // ADDED THIS LINE
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