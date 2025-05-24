// src/hooks/useForms.ts
import { useState, useEffect } from 'react';
import { Form } from '@/types/form';
import { fetchFormsService } from '@/app/api/services/formService'; // Corrected import path

interface UseFormsReturn {
  forms: Form[];
  loading: boolean;
  error: string | null;
  refetchForms: () => void; // Optional: A function to manually refetch forms
}

export const useForms = (): UseFormsReturn => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFormsService();
      setForms(data);
    } catch (err: any) {
      console.error("Failed to fetch forms:", err);
      setError(err.message || "An unexpected error occurred while fetching forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []); // Empty dependency array means this runs once on mount

  // Expose a refetch function if needed
  const refetchForms = () => {
    fetchForms();
  };

  return { forms, loading, error, refetchForms };
};