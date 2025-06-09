// src/app/api/routes/form/options/[formId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation"; // Import validateId
import { handleApiError } from "@/lib/helpers/errorHandler"; // Import handleApiError

export async function GET(
  _: Request,
  { params }: { params: { formId: string } } 
) {
  try {
    const resolvedParams = await Promise.resolve(params); // Ensure params is resolved
    const formId = resolvedParams.formId; // Access formId after resolution

    const validation = validateId(formId, "Form ID"); // Use the resolved formId
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const validatedFormId = validation.id;

    const options = await prisma.formOption.findMany({
      where: { formId: validatedFormId },
    });
    return NextResponse.json(options);
  } catch (error: any) {
    return handleApiError(error, "fetch form options by form ID");
  }
}