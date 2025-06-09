// src/app/api/routes/form/response/by-form/[formId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation"; // Import the validation helper
import { handleApiError } from "@/lib/helpers/errorHandler"; // Import the error handler helper
import { responseInclude } from "@/lib/constants/prismaIncludes"; // Import the shared include object

export async function GET(
  _: Request,
  { params }: { params: Promise<{ formId: string }> } // Change params type to Promise
) {
  try {
    // AWAIT the params before using them
    const { formId } = await params;
    
    // Validate the formId using the helper
    const validation = validateId(formId, "Form ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const validatedFormId = validation.id;

    const responses = await prisma.response.findMany({
      where: {
        formId: validatedFormId,
        deletedAt: null, // Filter out soft-deleted responses
      },
      include: responseInclude, // Use the shared include for consistency
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(responses);
  } catch (error: any) {
    // Handle API errors using the centralized error handler
    return handleApiError(error, "fetch responses by form ID");
  }
}