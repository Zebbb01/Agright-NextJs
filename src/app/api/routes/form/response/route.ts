// src\app\api\routes\form\response\route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { convertDMSToDecimal } from "@/lib/helpers/convertDMSToDecimal";

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
            location: true
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

    console.log("Form submission received:", { formId, userId, values });

    // --- 1. Server-Side Validation ---
    if (!formId) {
      return NextResponse.json({ error: "formId is required" }, { status: 400 });
    }
    if (typeof userId !== 'number') {
      return NextResponse.json({ error: "userId must be a number" }, { status: 400 });
    }
    if (typeof values !== 'object' || values === null) {
        return NextResponse.json({ error: "values must be an object" }, { status: 400 });
    }

    const formFields = await prisma.formOption.findMany({
      where: { formId: parseInt(formId) },
    });

    const validationErrors: string[] = [];

    for (const field of formFields) {
      if (field.required) {
        const value = values[field.label];
        let isEmpty = false;

        if (field.type === "Checkbox") {
          isEmpty = !Array.isArray(value) || value.length === 0;
        } else if (field.type === "Image Upload" || field.type === "File Upload") {
          isEmpty = typeof value !== 'string' || value.trim() === '';
        } else {
          isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
        }

        if (isEmpty) {
          validationErrors.push(`'${field.label}' is a required field.`);
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // --- 2. Handle Image Upload Link ---
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

    // --- 3. Extract Location Data from Form Values ---
    const extractFormValue = (keys: string[]): any => {
      for (const key of keys) {
        const value = values[key];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return null;
    };

    // Extract location data with more flexible key matching
    const blocks = extractFormValue(['Block', 'block', 'blocks', 'Blocks']) || [];
    const farmName = extractFormValue(['Farm Name', 'farmName', 'farmname', 'FarmName', 'farm_name']) || '';
    const terrain = extractFormValue(['Terrain', 'terrain']) || '';
    const typeOfDisease = extractFormValue([
      'Types of Diseases', 
      'typeOfDisease', 
      'typesofdiseases', 
      'TypeOfDisease',
      'Type of Disease',
      'type_of_disease'
    ]) || '';
    
    console.log("Extracted location data:", { blocks, farmName, terrain, typeOfDisease });

    // --- 4. Create Location with complete data if we have an image upload ---
    if (imageUploadId) {
      try {
        // Get the image upload to access EXIF data
        const imageUpload = await prisma.imageUpload.findUnique({
          where: { id: imageUploadId },
          include: { location: true }
        });

        if (imageUpload) {
          let latitude = 0;
          let longitude = 0;
          let takenAt: Date | undefined; // Declare takenAt variable

          // Extract exifData once so it's available in this scope
          const exifData = imageUpload.exifData as any;

          // Extract GPS coordinates from EXIF data
          if (exifData && typeof exifData === 'object') {
            
            console.log("EXIF data found:", exifData);
            
            // Try different possible GPS field names
            const gpsLatDMS = exifData.GPSLatitude || exifData.gps?.GPSLatitude || exifData.GPS?.GPSLatitude;
            const gpsLngDMS = exifData.GPSLongitude || exifData.gps?.GPSLongitude || exifData.GPS?.GPSLongitude;
            const gpsLatRef = exifData.GPSLatitudeRef || exifData.gps?.GPSLatitudeRef || exifData.GPS?.GPSLatitudeRef;
            const gpsLngRef = exifData.GPSLongitudeRef || exifData.gps?.GPSLongitudeRef || exifData.GPS?.GPSLongitudeRef;
            
            // Use the helper for conversion
            if (typeof gpsLatDMS === 'string' && typeof gpsLatRef === 'string') {
              latitude = convertDMSToDecimal(gpsLatDMS, gpsLatRef) || 0;
            } else if (typeof gpsLatDMS === 'number') {
              latitude = gpsLatDMS; // If it's already a decimal number
            } else if (Array.isArray(gpsLatDMS) && gpsLatDMS.length >= 3 && typeof gpsLatRef === 'string') {
                // If it's an array [deg, min, sec], convert to DMS string for the helper
                const dmsString = `${gpsLatDMS[0]} deg ${gpsLatDMS[1]}' ${gpsLatDMS[2]}"`;
                latitude = convertDMSToDecimal(dmsString, gpsLatRef) || 0;
            }

            if (typeof gpsLngDMS === 'string' && typeof gpsLngRef === 'string') {
              longitude = convertDMSToDecimal(gpsLngDMS, gpsLngRef) || 0;
            } else if (typeof gpsLngDMS === 'number') {
              longitude = gpsLngDMS; // If it's already a decimal number
            } else if (Array.isArray(gpsLngDMS) && gpsLngDMS.length >= 3 && typeof gpsLngRef === 'string') {
                // If it's an array [deg, min, sec], convert to DMS string for the helper
                const dmsString = `${gpsLngDMS[0]} deg ${gpsLngDMS[1]}' ${gpsLngDMS[2]}"`;
                longitude = convertDMSToDecimal(dmsString, gpsLngRef) || 0;
            }
            
            console.log("Parsed GPS coordinates:", { latitude, longitude });
          } else {
            console.log("No GPS coordinates found in EXIF data");
          }

          // Extract and parse DateTimeOriginal
          const dateTimeOriginal = exifData?.DateTimeOriginal || exifData?.Exif?.DateTimeOriginal;
          if (typeof dateTimeOriginal === 'string') {
            // EXIF DateTimeOriginal format is "YYYY:MM:DD HH:MM:SS"
            const parts = dateTimeOriginal.split(/[: ]/);
            if (parts.length === 6) {
              const year = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JavaScript Date
              const day = parseInt(parts[2]);
              const hour = parseInt(parts[3]);
              const minute = parseInt(parts[4]);
              const second = parseInt(parts[5]);
              takenAt = new Date(year, month, day, hour, minute, second);
              console.log("Parsed DateTimeOriginal:", takenAt);
            } else {
              console.warn("Could not parse DateTimeOriginal format:", dateTimeOriginal);
            }
          } else {
            console.log("No DateTimeOriginal found in EXIF data");
          }

          // Only create location if we have some meaningful data (not all empty)
          const hasLocationData = farmName || terrain || typeOfDisease || 
                                  (Array.isArray(blocks) && blocks.length > 0) ||
                                  (latitude !== 0 || longitude !== 0) ||
                                  takenAt; // Include takenAt in check

          if (hasLocationData) {
            // Create location with complete data
            const locationData: any = {
              latitude,
              longitude,
              farmName: farmName || '',
              terrain: terrain || '',
              typeOfDisease: typeOfDisease || '',
              blocks: Array.isArray(blocks) ? blocks : (blocks ? [blocks] : []),
            };

            // Add takenAt if it was successfully parsed
            if (takenAt) {
              locationData.takenAt = takenAt;
            }

            console.log("Creating location with data:", locationData);

            const newLocation = await prisma.location.create({
              data: locationData
            });

            // Link the image upload to this location
            await prisma.imageUpload.update({
              where: { id: imageUploadId },
              data: { locationId: newLocation.id }
            });

            console.log("Location created and linked to image upload:", newLocation.id);
          } else {
            console.log("No meaningful location data found, skipping location creation");
          }
        } else {
          console.error("Image upload not found with ID:", imageUploadId);
        }
      } catch (locationError) {
        console.error("Error creating location:", locationError);
        // Continue with response creation even if location creation fails
      }
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
    console.error("POST response error:", error);
    return NextResponse.json({ error: "Failed to create response", details: error.message || 'Unknown error' }, { status: 500 });
  }
}