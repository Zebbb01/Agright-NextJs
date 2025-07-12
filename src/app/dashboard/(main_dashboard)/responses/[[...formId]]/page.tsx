// src/app/dashboard/responses/[[...formId]]/page.tsx

import { notFound } from "next/navigation";
import FormSelector from "@/components/widget/response/FormSelector";
import ResponseContainer from "@/components/widget/response/ResponseContainer";

interface ResponsePageProps {
  params: Promise<{
    formId?: string[];
  }>;
}

export default async function ResponsePage({ params }: ResponsePageProps) {
  // Await params before accessing properties
  const resolvedParams = await params;
  const formId = resolvedParams.formId?.[0] || "";

  // If no formId is provided, show form selector
  if (!formId) {
    return <FormSelector />;
  }

  // Basic validation - you might want to add more sophisticated validation
  if (formId.length < 1) {
    notFound();
  }

  return <ResponseContainer formId={formId} />;
}

// Optional: Add generateStaticParams for better performance if you have known form IDs
export async function generateStaticParams() {
  // This would fetch your forms at build time
  // const forms = await fetchForms();
  
  // return forms.map((form) => ({
  //   formId: [form.id],
  // }));
  
  return []; // Return empty array if you want all routes to be dynamic
}

// Optional: Add metadata generation
export async function generateMetadata({ params }: ResponsePageProps) {
  const resolvedParams = await params;
  const formId = resolvedParams.formId?.[0];
  
  if (!formId) {
    return {
      title: "Select Form Responses",
      description: "Choose a form to view responses",
    };
  }
  
  return {
    title: `Form ${formId} Responses `,
    description: `View and manage responses for form ${formId}`,
  };
}