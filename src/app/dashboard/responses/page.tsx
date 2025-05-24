"use client";

import { useSearchParams } from "next/navigation";
import FormSelector from "@/components/widget/response/FormSelector";
import ResponseContainer from "@/components/widget/response/ResponseContainer";

export default function ResponsePage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId") ?? "";

  if (!formId) {
    return <FormSelector />;
  }

  return <ResponseContainer formId={formId} />;
}
