'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import FormSelector from '@/components/widget/FormSelector'
import ResponsesTable from '@/components/table/ResponsesTable'
import ResponsePanel from '@/components/widget/ResponsePanel'

export default function ResponsePage({ isAdmin }: { isAdmin: boolean }) {
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')
  const [isCreating, setIsCreating] = useState(false)

  if (!isAdmin && !formId) {
    return <FormSelector />
  }

  return (
    <div className="space-y-6">
      {/* <h1 className="text-xl font-bold mb-4">
        {isAdmin ? 'All Responses' : `Responses for Form ID: ${formId}`}
      </h1> */}

      {isCreating ? (
        <ResponsePanel setIsOpen={setIsCreating} formId={formId || ''} />
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
