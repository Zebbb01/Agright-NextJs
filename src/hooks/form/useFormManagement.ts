// src/hooks/useFormManagement.ts
import { useState, useEffect } from "react";
import { Form } from "@/types/form";
import { fetchFormService } from "@/app/api/services/formService"; // Corrected import path
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
  form: Form | null;
  loadingForm: boolean;
  errorFetchingForm: string | null;
  user: AuthUser | null;
  isLoadingAuth: boolean;
  isAdmin: boolean;
  refetchForm: () => void; // Function to refetch the form
}

export const useFormManagement = ({ formId }: UseFormManagementProps): UseFormManagementReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
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

  const fetchForm = async () => {
    if (!formId) return;

    setLoadingForm(true);
    setErrorFetchingForm(null);
    try {
      const data = await fetchFormService(formId);
      setForm(data);
    } catch (err: any) {
      console.error("Failed to fetch form:", err);
      setErrorFetchingForm(err.message || "Failed to load form details.");
    } finally {
      setLoadingForm(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [formId]);

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