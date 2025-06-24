// src/hooks/useFormManagement.ts
import { useState, useEffect, useCallback } from "react";
import { Form, FormOption } from "@/types/form"; // Import FormOption
import { fetchFormByIdService } from "@/app/api/services/formService"; // Corrected import to fetchFormByIdService
import { useAuth } from "@/context/auth-context"; // Assuming this is correct

interface UseFormManagementProps {
  formId?: string; // formId is optional, as the container might manage creation without a specific form selected yet
}

interface UserRole {
  name: string;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  // Add other user properties as needed
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  // Add other auth related properties as needed
}

interface UseFormManagementReturn {
  isCreating: boolean;
  setIsCreating: (open: boolean) => void;
  form: (Form & { fields: FormOption[] }) | null; // Updated type to include fields
  loadingForm: boolean;
  errorFetchingForm: string | null;
  user: AuthUser | null;
  isLoadingAuth: boolean;
  isAdmin: boolean;
  refetchForm: () => void; // Function to refetch the form
}

export const useFormManagement = ({ formId }: UseFormManagementProps): UseFormManagementReturn => {
  const [isCreating, setIsCreating] = useState(false);
  // Initial state for form can be null, and it will be populated with fields after fetch
  const [form, setForm] = useState<(Form & { fields: FormOption[] }) | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorFetchingForm, setErrorFetchingForm] = useState<string | null>(null);

  // Assuming useAuth provides user and isLoading properties
  const { user: rawUser, isLoading: isLoadingAuth } = useAuth();

  // Map rawUser to AuthUser type, handling role nullability
  const user: AuthUser | null = rawUser
    ? {
        ...rawUser,
        role: rawUser.role && rawUser.role !== null
          ? { name: rawUser.role.name }
          : undefined,
      }
    : null;

  const isAdmin = user?.role?.name.toLowerCase() === "admin";

  const fetchForm = useCallback(async () => { // Wrapped in useCallback
    if (!formId) {
      setForm(null); // Clear form if no formId
      return;
    }

    setLoadingForm(true);
    setErrorFetchingForm(null);
    try {
      // Use fetchFormByIdService to get form and its options/fields
      const data = await fetchFormByIdService(formId);
      setForm(data);
    } catch (err: any) {
      console.error("Failed to fetch form:", err);
      setErrorFetchingForm(err.message || "Failed to load form details.");
    } finally {
      setLoadingForm(false);
    }
  }, [formId]); // Depend on formId to refetch when it changes

  useEffect(() => {
    fetchForm();
  }, [fetchForm]); // Depend on fetchForm function

  const refetchForm = () => {
    fetchForm();
  };

  return {
    isCreating,
    setIsCreating,
    form,
    loadingForm,
    errorFetchingForm,
    user,
    isLoadingAuth,
    isAdmin,
    refetchForm,
  };
};
