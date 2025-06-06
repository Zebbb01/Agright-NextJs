// src/types/form.ts

import { Dispatch, SetStateAction } from "react";

export interface FormOption {
  id: string;
  formId: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
}

export interface FormData {
  [key: string]: any;
}

export interface FormResponsePayload {
  formId: string;
  userId: number;
  values: FormData;
}

export interface Form {
  id: string;
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
  id: number;
  formId: number;
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
}

export interface ResponsesTableProps {
  formId?: string; // Optional formId to fetch responses for a specific form
  isAdmin?: boolean; // isAdmin prop passed from parent (e.g., ResponsesTableContainer)
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
  handleDeleteResponse: (id: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
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