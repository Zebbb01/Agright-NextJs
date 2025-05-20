// src/app/dashboard/forms/[formId]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import FormPanelContainer from '@/components/container/FormPanelContainer';

export default function FormPage() {
  const params = useParams();
  const formId = params.formId as string;

  if (!formId) return <div>Form ID is missing</div>;

  return <FormPanelContainer formId={formId} />;
}
