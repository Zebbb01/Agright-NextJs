// src/app/api/routes/image-upload/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types like JsonNull/DbNull if needed, but 'null' is generally sufficient for Json?

// Helper function to convert DMS string to decimal degrees
function convertDMSToDecimal(dmsString: string, ref: string): number | null {
  if (!dmsString || !ref) return null;

  const parts = dmsString.match(/(\d+) deg (\d+)' ([\d.]*)"/);
  if (!parts || parts.length < 4) return null;

  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    decimal *= -1;
  }
  return decimal;
}

export async function POST(req: Request) {
  try {
    const {
      public_id,
      secure_url,
      format,
      width,
      height,
      resource_type,
      original_filename,
      exifData, // Cloudinary sends this as image_metadata
    } = await req.json();

    if (!public_id || !secure_url) {
      return NextResponse.json({ error: 'Missing Cloudinary public_id or secure_url.' }, { status: 400 });
    }

    let locationId: number | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;

    // --- Extract GPS data from exifData if available ---
    // Cloudinary's image_metadata often nests EXIF data under a 'GPS' key or similar,
    // or directly at the top level for common tags. Let's adapt based on the sample.
    // The sample shows GPSLatitude, GPSLongitude directly at top level of exifData object.
    if (exifData) {
      const gpsLatitudeString = exifData.GPSLatitude;
      const gpsLatitudeRef = exifData.GPSLatitudeRef;
      const gpsLongitudeString = exifData.GPSLongitude;
      const gpsLongitudeRef = exifData.GPSLongitudeRef;

      if (gpsLatitudeString && gpsLatitudeRef && gpsLongitudeString && gpsLongitudeRef) {
        latitude = convertDMSToDecimal(gpsLatitudeString, gpsLatitudeRef);
        longitude = convertDMSToDecimal(gpsLongitudeString, gpsLongitudeRef);
      }

      if (latitude !== null && longitude !== null) {
        // Round coordinates to a reasonable precision for database storage and lookup
        // Using 6 decimal places for latitude/longitude provides accuracy down to ~0.1 meter
        const roundedLatitude = parseFloat(latitude.toFixed(6));
        const roundedLongitude = parseFloat(longitude.toFixed(6));

        // Try to find an existing location with these coordinates
        let existingLocation = await prisma.location.findFirst({
          where: {
            latitude: roundedLatitude,
            longitude: roundedLongitude,
          },
        });

        if (existingLocation) {
          locationId = existingLocation.id;
        } else {
          // If not found, create a new Location
          const newLocation = await prisma.location.create({
            data: {
              latitude: roundedLatitude,
              longitude: roundedLongitude,
              // You might want to extract more details from EXIF or make these editable later
              farmName: 'Location from Image EXIF', // Default name
              terrain: 'Unknown', // Default
              typeOfDisease: 'None', // Default
              blocks: [], // Empty array for blocks
            },
          });
          locationId = newLocation.id;
        }
      }
    }

    const newImageUpload = await prisma.imageUpload.create({
      data: {
        publicId: public_id,
        secureUrl: secure_url,
        format: format,
        width: width,
        height: height,
        resourceType: resource_type,
        originalFilename: original_filename,
        exifData: exifData || null, 
        locationId: locationId,
      },
    });

    return NextResponse.json({
      message: 'Image upload details saved successfully.',
      imageUpload: newImageUpload,
    });
  } catch (error: any) {
    console.error('API Error: Failed to save image upload details:', error);
    return NextResponse.json(
      { error: 'Failed to save image upload details.', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}