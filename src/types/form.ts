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
  date?: Date | string;
  deletedAt: string | Date | null;
}

export interface FormField {
  id: number;
  type: string;
  label: string;
  options?: string[];
  required: boolean;
}

export interface FileUploadResult {
  secureUrl: string;
  id: number;
  takenAt?: string; // ISO date string from EXIF data
  originalFilename?: string; // <<< ADDED
}

export interface FormResponse {
  id: number;
  formId: string;
  userId: number;
  values: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  form?: {
    id: string;
    name: string;
  };
  imageUpload?: {
    id: number;
    secureUrl: string;
    originalFilename?: string; // <<< ADDED
    location?: {
      latitude?: number;
      longitude?: number;
      takenAt?: string; // ISO date string
    };
  };
}

export interface ResponsesTableProps {
  formId?: string;
  isAdmin?: boolean;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
}

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
  handleViewResponse: (responseId: number) => void;
  handleEditResponse: (responseId: number) => void;
}

export interface FormSummary {
  formId: string;
  formName: string;
  formDetails: string;
  responseCount: number;
  lastResponseUser?: string;
}

export interface FormSummaryTableProps {
  summaryData: FormSummary[];
  loading: boolean;
  error: string | null;
  onViewFormBlocks: (formId: string) => void;
}

export interface FormPanelProps {
  setIsOpen: (open: boolean) => void;
  formId?: string | null;
  isReadOnly?: boolean;
  onFormUpdated?: () => void;
}

export interface UseFormBuilderProps {
  formId?: string | null;
  onFormCreated?: () => void;
  onFormUpdated?: () => void;
}

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
  handleUpdateForm: (formId: string) => Promise<void>;
  fetchFormForEdit: (formId: string) => Promise<void>;
  creatingForm: boolean;
  updatingForm: boolean;
  createFormError: string | null;
  updateFormError: string | null;
  isFormBuilderInvalid: boolean;
  resetFormBuilder: () => void;
}

export interface FormBlockSummaryProps {
  selectedFormId: string | null;
  onBackToSummary: () => void;
}

export interface BlockResponseDetail {
  responseId: number;
  userId: number;
  userName: string;
  createdAt: string; // ISO string
}

export interface FormBlockData {
  formName: string;
  totalBlocks: number;
  filledBlocks: { [label: string]: number };
  options: FormOption[];
  respondedBlockNumbersForBlockLabel: number[];
  blockResponseDetails: Record<number, BlockResponseDetail[]>;
}
