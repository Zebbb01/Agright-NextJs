// src/app/api/routes/form/response/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        form: true,
        imageUpload: {
          include: {
            location: true // Include location details if linked to the image
          }
        },
      }
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error("GET all responses error:", error);
    return NextResponse.json({ error: "Failed to fetch all responses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formId, userId, values } = body;

    let imageUploadId: number | undefined;
    // Assuming you store the ImageUpload's DB ID in your form values
    if (values['imageUploadDbId']) { // Use a clear key like 'imageUploadDbId'
      imageUploadId = values['imageUploadDbId'];
    }

    let locationToAssociateId: number | undefined;

    // --- Handle Location Data from Form Input ---
    // This is for location data explicitly entered by the user in the form,
    // which might override or supplement EXIF data.
    const formLatitude = values['Location Latitude'];
    const formLongitude = values['Location Longitude'];
    const farmName = values['Farm Name'];
    const terrain = values['Terrain'];
    const typeOfDisease = values['Type of Disease'];
    const blocks = values['Blocks'];

    if (imageUploadId) {
      // If an image was uploaded, check if it already has a location from EXIF
      const existingImageUpload = await prisma.imageUpload.findUnique({
        where: { id: imageUploadId },
        select: { locationId: true }
      });

      if (existingImageUpload?.locationId) {
        // Image already has a location linked (likely from EXIF)
        locationToAssociateId = existingImageUpload.locationId;

        // Optionally, update the existing location with form data if more details are provided
        if (farmName || terrain || typeOfDisease || blocks) {
          await prisma.location.update({
            where: { id: locationToAssociateId },
            data: {
              farmName: farmName || undefined, // Only update if provided
              terrain: terrain || undefined,
              typeOfDisease: typeOfDisease || undefined,
              blocks: blocks || undefined,
            }
          });
        }
      } else if (formLatitude && formLongitude && farmName) {
        // No location from EXIF, but form provided explicit location data
        // Try to find an existing location based on form input coordinates
        let existingLocation = await prisma.location.findFirst({
          where: {
            latitude: parseFloat(formLatitude),
            longitude: parseFloat(formLongitude),
            // Add more conditions for uniqueness if desired
          },
        });

        if (existingLocation) {
          locationToAssociateId = existingLocation.id;
        } else {
          // Create new location based on form input
          const newLocation = await prisma.location.create({
            data: {
              latitude: parseFloat(formLatitude),
              longitude: parseFloat(formLongitude),
              farmName: farmName,
              terrain: terrain || 'Unknown',
              typeOfDisease: typeOfDisease || 'None',
              blocks: blocks || [],
            },
          });
          locationToAssociateId = newLocation.id;
        }
        // Link the image to this location if we just created it or found it
        await prisma.imageUpload.update({
          where: { id: imageUploadId },
          data: { locationId: locationToAssociateId },
        });
      }
    } else if (formLatitude && formLongitude && farmName) {
      // No image uploaded, but form provided explicit location data
      let existingLocation = await prisma.location.findFirst({
        where: {
          latitude: parseFloat(formLatitude),
          longitude: parseFloat(formLongitude),
        },
      });

      if (existingLocation) {
        locationToAssociateId = existingLocation.id;
      } else {
        const newLocation = await prisma.location.create({
          data: {
            latitude: parseFloat(formLatitude),
            longitude: parseFloat(formLongitude),
            farmName: farmName,
            terrain: terrain || 'Unknown',
            typeOfDisease: typeOfDisease || 'None',
            blocks: blocks || [],
          },
        });
        locationToAssociateId = newLocation.id;
      }
    }

    // --- Create the Response Record ---
    const response = await prisma.response.create({
      data: {
        formId: parseInt(formId),
        userId: userId,
        values: values,
        imageUploadId: imageUploadId, // Link the Response to the ImageUpload record
      },
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("POST response error:", error);
    return NextResponse.json({ error: "Failed to create response", details: error.message || 'Unknown error' }, { status: 500 });
  }
}