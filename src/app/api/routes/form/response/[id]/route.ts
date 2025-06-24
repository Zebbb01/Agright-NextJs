// src/app/api/routes/form/response/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation";
import { handleApiError } from "@/lib/helpers/errorHandler";
import { responseInclude } from "@/lib/constants/prismaIncludes";
// The following imports are not needed for the DELETE function and can be removed if desired
// import { validateFormValues } from "@/lib/helpers/formValidation";
// import { processImageLocation } from "@/lib/helpers/locationHelpers";

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
    // Make sure validateFormValues and processImageLocation are imported if used
    // const validationErrors = await validateFormValues(formId, updatedValues);
    // if (validationErrors.length > 0) {
    //   return NextResponse.json(
    //     { error: "Validation failed", details: validationErrors },
    //     { status: 400 }
    //   );
    // }

    // --- 2. Handle Image Upload Link and Location Data Update ---
    // const newImageUploadId = imageUploadId || existingResponse.imageUploadId;
    // if (newImageUploadId) {
    //   await processImageLocation(newImageUploadId, updatedValues);
    // }

    // --- 3. Update the Response Record ---
    const updatedResponse = await prisma.response.update({
      where: { id: Number(responseId) },
      data: {
        values: updatedValues,
        imageUploadId: imageUploadId || existingResponse.imageUploadId, // Use new id or existing
        userId: userId || existingResponse.userId,
      },
      include: responseInclude,
    });

    return NextResponse.json(updatedResponse, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "update response or restore response");
  }
}

/**
 * PERMANENTLY DELETE a Response and its associated ImageUpload and Location data
 * if those are no longer referenced by other *active* records.
 */
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
    const validatedResponseId = validation.id;

    // Use a transaction to ensure atomicity: either all deletions succeed, or none do.
    await prisma.$transaction(async (tx) => {
      // 1. Find the Response to get its imageUploadId before deletion.
      const responseToDelete = await tx.response.findUnique({
        where: { id: validatedResponseId },
        select: { imageUploadId: true },
      });

      if (!responseToDelete) {
        throw new Error("Response not found.");
      }

      const imageUploadId = responseToDelete.imageUploadId;

      // Proceed with deleting associated ImageUpload and Location only if an image was linked.
      if (imageUploadId) {
        // 2. Check if this ImageUpload is referenced by ANY OTHER *ACTIVE* Responses.
        // We exclude the current response being deleted from this count.
        const otherActiveResponsesReferencingImage = await tx.response.count({
          where: {
            imageUploadId: imageUploadId,
            id: { not: validatedResponseId }, // Exclude the response currently being deleted
            deletedAt: null, // <--- MODIFIED: Only count active (non-soft-deleted) responses
          },
        });

        // If no other *active* responses reference this ImageUpload, it's safe to consider deleting it.
        // This means it will be deleted even if soft-deleted responses still point to it.
        if (otherActiveResponsesReferencingImage === 0) {
          // Fetch the ImageUpload to get its locationId.
          const imageUploadToDelete = await tx.imageUpload.findUnique({
            where: { id: imageUploadId },
            select: { locationId: true },
          });

          // If the ImageUpload exists and has a linked location.
          if (imageUploadToDelete && imageUploadToDelete.locationId) {
            const locationId = imageUploadToDelete.locationId;

            // 3. Check if this Location is referenced by ANY OTHER *ACTIVE* ImageUploads.
            // We exclude the current image upload (which is about to be deleted) from this count.
            const otherActiveImageUploadsReferencingLocation = await tx.imageUpload.count({
              where: {
                locationId: locationId,
                id: { not: imageUploadId }, // Exclude the image upload currently being considered for deletion
                Response: { // <--- Added condition to check for active responses linked to these ImageUploads
                    some: {
                        deletedAt: null // At least one active response must be linked
                    }
                }
              },
            });

            // If no other *active* image uploads reference this Location, it's safe to delete it.
            // This means it will be deleted even if soft-deleted image uploads still point to it.
            if (otherActiveImageUploadsReferencingLocation === 0) {
              await tx.location.delete({
                where: { id: locationId },
              });
            }
          }

          // Finally, delete the ImageUpload record since no other *active* responses use it.
          await tx.imageUpload.delete({
            where: { id: imageUploadId },
          });
        }
      }

      // 4. Perform the hard delete of the Response itself.
      await tx.response.delete({
        where: { id: validatedResponseId },
      });
    });

    return new NextResponse("Response and associated data permanently deleted successfully", { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "permanently delete response and associated data");
  }
}
