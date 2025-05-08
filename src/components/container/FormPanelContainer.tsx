'use client';

import { useState } from 'react';
import FormPanel from '../widget/FormPanel';
import FormTable from '../table/FormTable';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export default function FormPanelContainer() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      {isCreating ? (
        <div className="flex justify-center mx-auto mb-4">
          <FormPanel setIsOpen={setIsCreating} />
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
