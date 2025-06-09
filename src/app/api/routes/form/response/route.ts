// src/app/api/routes/form/response/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/helpers/errorHandler";
import { responseInclude } from "@/lib/constants/prismaIncludes";
import { validateFormValues } from "@/lib/helpers/formValidation";
import { processImageLocation } from "@/lib/helpers/locationHelpers"; // Make sure this import is available

export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: responseInclude, // Replaced with shared include object
    });
    return NextResponse.json(responses);
  } catch (error: any) { // Explicitly type error as 'any' for consistency with handleApiError
    return handleApiError(error, "fetch all responses");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formId, userId, values } = body;

    console.log("Form submission received:", { formId, userId, values });

    // --- 1. Initial Server-Side Validation for basic fields ---
    if (!formId) {
      return NextResponse.json({ error: "formId is required" }, { status: 400 });
    }
    if (typeof userId !== 'number') {
      return NextResponse.json({ error: "userId must be a number" }, { status: 400 });
    }
    if (typeof values !== 'object' || values === null) {
      return NextResponse.json({ error: "values must be an object" }, { status: 400 });
    }

    // --- 2. Validate form-specific values using the helper ---
    const validationErrors = await validateFormValues(parseInt(formId), values);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // --- 3. Handle Image Upload Link ---
    let imageUploadId: number | undefined;

    // Look for any field that ends with 'DbId' which contains the image upload ID
    const imageUploadDbIdKey = Object.keys(values).find(key => key.endsWith('DbId'));

    if (imageUploadDbIdKey && values[imageUploadDbIdKey]) {
      const parsedImageUploadId = parseInt(values[imageUploadDbIdKey], 10);
      if (!isNaN(parsedImageUploadId)) {
        imageUploadId = parsedImageUploadId;
        console.log("Found image upload ID:", imageUploadId);
      } else {
        console.warn("Invalid imageUploadDbId received:", values[imageUploadDbIdKey]);
      }
    }

    // --- 4. Process Location Data with Image Upload (if applicable) ---
    if (imageUploadId) {
      // The logic for extracting location data from form values and processing EXIF
      // is now encapsulated in processImageLocation.
      await processImageLocation(imageUploadId, values);
    } else {
      console.log("No image upload ID found, skipping location creation");
      console.log("Available form values keys:", Object.keys(values));
    }

    // --- 5. Create the Response Record ---
    const response = await prisma.response.create({
      data: {
        formId: parseInt(formId),
        userId: userId,
        values: values,
        imageUploadId: imageUploadId,
      },
    });

    console.log("Response created successfully:", response.id);

    return NextResponse.json(response);
  } catch (error: any) {
    return handleApiError(error, "create response");
  }
}