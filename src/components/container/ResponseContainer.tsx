'use client';

import { useState } from 'react';
import ResponsePanel from '../widget/ResponsePanel';
import ResponsesTable from '../table/ResponsesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ResponseContainer() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      {isCreating ? (
          <ResponsePanel setIsOpen={setIsCreating} formId={''} />
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus size={16} /> Add Response
            </Button>
          </div>
          <ResponsesTable setIsCreating={setIsCreating} />
        </>
      )}
    </div>
  );
}