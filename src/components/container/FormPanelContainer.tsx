// src/components/container/FormPanelContainer.tsx

'use client';

import { useEffect, useState } from 'react';
import FormPanel from '../widget/FormPanel';
import FormTable from '../table/FormTable';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Form } from '@/types/form';

interface Props {
  formId: string;
}

export default function FormPanelContainer({ formId }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    // Fetch form data based on formId
    fetch(`/api/routes/form/${formId}`)
      .then((res) => res.json())
      .then((data) => setForm(data));
  }, [formId]);

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {isCreating ? (
        <div className="flex justify-center mx-auto mb-4">
          <FormPanel setIsOpen={setIsCreating} form={form} />
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Create New Form
            </Button>
          </div>
          <FormTable setIsCreating={setIsCreating} />
        </>
      )}
    </div>
  );
}
