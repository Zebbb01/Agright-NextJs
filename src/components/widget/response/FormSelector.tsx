// src/components/widget/response/FormSelector.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useForms } from '@/hooks/form/useForms'; 

export default function FormSelector() {
  const router = useRouter();
  const { forms, loading, error, refetchForms } = useForms(); 

  const handleSelectForm = (formId: string) => {
    router.push(`/dashboard/responses?formId=${formId}`);
  };

  // --- Conditional Rendering for Loading and Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4 text-center text-red-500">
        <p>Error: {error}</p>
        <Button onClick={refetchForms}>Try Again</Button> {/* Use refetchForms */}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4 text-center text-gray-500">
        <h2 className="text-xl font-semibold">No Forms Available</h2>
        <p>There are no forms to display at the moment.</p>
        <Button onClick={refetchForms}>Refresh</Button> {/* Optionally allow refresh */}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">
        Choose a Form to Respond
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {forms.map((form) => (
          <Card
            key={form.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => handleSelectForm(form.id)}
          >
            <CardContent className="p-6">
              <h3 className="font-medium text-lg">{form.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}