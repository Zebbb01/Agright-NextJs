'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import FormSelector from '@/components/widget/FormSelector'
import ResponsesTable from '@/components/table/ResponsesTable'
import ResponsePanel from '@/components/widget/ResponsePanel'
import { forms } from '@/data/form'

export default function ResponsePage({ isAdmin }: { isAdmin: boolean }) {
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')
  const [isCreating, setIsCreating] = useState(false)

  // Find the form name based on the formId
  const form = forms.find(f => f.id === formId)

  if (!isAdmin && !formId) {
    return <FormSelector />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold mb-4">
        {isAdmin
          ? 'All Responses'
          : form
            ? `Responses for ${form.name}`  // Display the form name
            : `Responses for Form ID: ${formId}`} {/* Fallback in case the form is not found */}
      </h1>

      {isCreating ? (
        <div className="flex justify-center mx-auto mb-4">
          <ResponsePanel setIsOpen={setIsCreating} formId={formId || ''} />
        </div>
      ) : (
        <ResponsesTable
          formId={formId}
          isAdmin={isAdmin}
          setIsCreating={setIsCreating}
          showAddButton={!isAdmin}
        />
      )}
    </div>
  )
}
