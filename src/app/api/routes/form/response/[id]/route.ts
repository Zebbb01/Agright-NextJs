// src/app/api/routes/form/response/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation";
import { handleApiError } from "@/lib/helpers/errorHandler";
import { responseInclude } from "@/lib/constants/prismaIncludes";
import { validateFormValues } from "@/lib/helpers/formValidation";
import { processImageLocation } from "@/lib/helpers/locationHelpers";


export async function GET(
  _: Request,
  { params }: { params: { id: string } } // Type is already defined as object
) {
  try {
    // This is the line that likely caused the error previously if not awaited
    // based on the previous error:
    // const validation = validateId(params.id, "Response ID");

    // We need to ensure 'params' is fully resolved before accessing 'id'.
    // Even if the type definition is `{ id: string }`, Next.js can pass it
    // as a Promise-like object internally, leading to this error.
    const resolvedParams = await Promise.resolve(params);
    const responseId = resolvedParams.id; // Access 'id' after resolution

    const validation = validateId(responseId, "Response ID"); // Use the resolved ID
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const validatedResponseId = validation.id; // Renamed to avoid confusion

    const response = await prisma.response.findUnique({
      where: { id: validatedResponseId },
      include: responseInclude,
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return handleApiError(error, "fetch single response");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Apply the same fix here for PATCH
    const resolvedParams = await Promise.resolve(params);
    const responseId = resolvedParams.id;

    const validation = validateId(responseId, "Response ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    // const responseId = validation.id; // No need to re-declare, use the one from resolvedParams/validation

    const body = await req.json();
    const { values, imageUploadId, userId } = body;

    const existingResponse = await prisma.response.findUnique({
      where: { id: Number(responseId) }, // Convert responseId to number
      select: {
        formId: true,
        imageUploadId: true,
        values: true,
        userId: true,
      },
    });

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    const formId = existingResponse.formId;

    const updatedValues = {
      ...(typeof existingResponse.values === 'object' && existingResponse.values !== null ? existingResponse.values : {}),
      ...(typeof values === 'object' && values !== null ? values : {})
    };

    // --- 1. Server-Side Validation ---
    const validationErrors = await validateFormValues(formId, updatedValues);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // --- 2. Handle Image Upload Link and Location Data Update ---
    const newImageUploadId = imageUploadId || existingResponse.imageUploadId;
    if (newImageUploadId) {
      await processImageLocation(newImageUploadId, updatedValues);
    }

    // --- 3. Update the Response Record ---
    const updatedResponse = await prisma.response.update({
      where: { id: Number(responseId) }, // Use the resolved responseId here
      data: {
        values: updatedValues,
        imageUploadId: newImageUploadId,
        userId: userId || existingResponse.userId,
      },
      include: responseInclude,
    });

    return NextResponse.json(updatedResponse, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "update response");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Apply the same fix here for DELETE
    const resolvedParams = await Promise.resolve(params);
    const responseId = resolvedParams.id;

    const validation = validateId(responseId, "Response ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    // const responseId = validation.id; // No need to re-declare, use the one from resolvedParams/validation

    const softDeletedResponse = await prisma.response.update({
      where: { id: Number(responseId) }, // Use the resolved responseId here
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(softDeletedResponse, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "soft-delete response");
  }
}