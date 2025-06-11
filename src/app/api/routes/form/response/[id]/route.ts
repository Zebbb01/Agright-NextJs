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
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const responseId = resolvedParams.id;

    const validation = validateId(responseId, "Response ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const validatedResponseId = validation.id;

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
    const resolvedParams = await Promise.resolve(params);
    const responseId = resolvedParams.id;

    const validation = validateId(responseId, "Response ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }

    const body = await req.json();

    // Handle restore action
    if (body.action === "restore") {
      const restoredResponse = await prisma.response.update({
        where: { id: Number(responseId) },
        data: {
          deletedAt: null, // Set deletedAt to null to restore
        },
      });
      return NextResponse.json(restoredResponse, { status: 200 });
    }

    // Handle soft-delete action (move to archive)
    if (body.action === "soft-delete") {
        const softDeletedResponse = await prisma.response.update({
            where: { id: Number(responseId) },
            data: {
                deletedAt: new Date(), // Set deletedAt to current date for soft delete
            },
        });
        return NextResponse.json(softDeletedResponse, { status: 200 });
    }

    // Original PATCH logic for updating response values (if it exists)
    const { values, imageUploadId, userId } = body;

    const existingResponse = await prisma.response.findUnique({
      where: { id: Number(responseId) },
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
      ...(typeof existingResponse.values === "object" &&
      existingResponse.values !== null
        ? existingResponse.values
        : {}),
      ...(typeof values === "object" && values !== null ? values : {}),
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
      where: { id: Number(responseId) },
      data: {
        values: updatedValues,
        imageUploadId: newImageUploadId,
        userId: userId || existingResponse.userId,
      },
      include: responseInclude,
    });

    return NextResponse.json(updatedResponse, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "update response or restore response");
  }
}

// PERMANENTLY DELETE a Response
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const responseId = resolvedParams.id;

    const validation = validateId(responseId, "Response ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }

    // PERFORM HARD DELETE
    await prisma.response.delete({
      where: { id: Number(responseId) }, // Ensure ID is a number for response deletion
    });

    return new NextResponse("Response permanently deleted successfully", { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "permanently delete response");
  }
}