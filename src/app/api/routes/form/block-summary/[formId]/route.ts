// src/app/api/routes/form/block-summary/[formId]/route.ts
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/helpers/errorHandler";
import { fetchFormDetailsAndResponsesForBlocksService } from "@/app/api/services/forms/formBlockSummaryService"; // Import the service

export async function GET(
  _: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = await Promise.resolve(params); // AWAIT the params

    // The service handles validation and data fetching
    const formBlockData = await fetchFormDetailsAndResponsesForBlocksService(Number(formId));

    if (!formBlockData) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(formBlockData);
  } catch (error: any) {
    return handleApiError(error, "fetch form block summary");
  }
}
