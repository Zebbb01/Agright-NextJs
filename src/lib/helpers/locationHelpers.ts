// lib/helpers/locationHelpers.ts (or similar)
import { prisma } from "@/lib/prisma"; // Assuming prisma is accessible or passed
import { convertDMSToDecimal } from "@/lib/helpers/convertDMSToDecimal";

export async function processImageLocation(
  imageUploadId: number,
  formValues: Record<string, any>
) {
  try {
    const imageUpload = await prisma.imageUpload.findUnique({
      where: { id: imageUploadId },
      include: { location: true },
    });

    if (!imageUpload) {
      console.warn("Image upload not found for ID:", imageUploadId);
      return; // Or throw an error if this is critical
    }

    let latitude = imageUpload.location?.latitude || 0;
    let longitude = imageUpload.location?.longitude || 0;
    let takenAt: Date | undefined = imageUpload.location?.takenAt || undefined;

    const exifData = imageUpload.exifData as any;

    if (exifData && typeof exifData === 'object') {
      const gpsLatDMS = exifData.GPSLatitude || exifData.gps?.GPSLatitude || exifData.GPS?.GPSLatitude;
      const gpsLngDMS = exifData.GPSLongitude || exifData.gps?.GPSLongitude || exifData.GPS?.GPSLongitude;
      const gpsLatRef = exifData.GPSLatitudeRef || exifData.gps?.GPSLatitudeRef || exifData.GPS?.GPSLatitudeRef;
      const gpsLngRef = exifData.GPSLongitudeRef || exifData.gps?.GPSLongitudeRef || exifData.GPS?.GPSLongitudeRef;

      // Latitude conversion
      if (typeof gpsLatDMS === 'string' && typeof gpsLatRef === 'string') {
        latitude = convertDMSToDecimal(gpsLatDMS, gpsLatRef) || latitude;
      } else if (typeof gpsLatDMS === 'number') {
        latitude = gpsLatDMS;
      } else if (Array.isArray(gpsLatDMS) && gpsLatDMS.length >= 3 && typeof gpsLatRef === 'string') {
        const dmsString = `${gpsLatDMS[0]} deg ${gpsLatDMS[1]}' ${gpsLatDMS[2]}"`;
        latitude = convertDMSToDecimal(dmsString, gpsLatRef) || latitude;
      }

      // Longitude conversion
      if (typeof gpsLngDMS === 'string' && typeof gpsLngRef === 'string') {
        longitude = convertDMSToDecimal(gpsLngDMS, gpsLngRef) || longitude;
      } else if (typeof gpsLngDMS === 'number') {
        longitude = gpsLngDMS;
      } else if (Array.isArray(gpsLngDMS) && gpsLngDMS.length >= 3 && typeof gpsLngRef === 'string') {
        const dmsString = `${gpsLngDMS[0]} deg ${gpsLngDMS[1]}' ${gpsLngDMS[2]}"`;
        longitude = convertDMSToDecimal(dmsString, gpsLngRef) || longitude;
      }

      const dateTimeOriginal = exifData?.DateTimeOriginal || exifData?.Exif?.DateTimeOriginal;
      if (typeof dateTimeOriginal === 'string') {
        const parts = dateTimeOriginal.split(/[: ]/);
        if (parts.length === 6) {
          takenAt = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            parseInt(parts[3]),
            parseInt(parts[4]),
            parseInt(parts[5])
          );
        }
      }
    }

    const extractFormValue = (keys: string[]): any => {
      for (const key of keys) {
        const value = formValues[key];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return null;
    };

    const blocks = extractFormValue(['Block', 'block', 'blocks', 'Blocks']) || [];
    const farmName = extractFormValue(['Farm Name', 'farmName', 'farmname', 'FarmName', 'farm_name']) || '';
    const terrain = extractFormValue(['Terrain', 'terrain']) || '';
    const typeOfDisease = extractFormValue([
      'Types of Diseases', 'typeOfDisease', 'typesofdiseases', 'TypeOfDisease', 'Type of Disease', 'type_of_disease'
    ]) || '';

    const hasLocationData = farmName || terrain || typeOfDisease ||
      (Array.isArray(blocks) && blocks.length > 0) ||
      (latitude !== 0 || longitude !== 0) ||
      takenAt;

    if (hasLocationData) {
      const locationData: any = {
        latitude,
        longitude,
        farmName: farmName || '',
        terrain: terrain || '',
        typeOfDisease: typeOfDisease || '',
        blocks: Array.isArray(blocks) ? blocks : (blocks ? [blocks] : []),
      };
      if (takenAt) {
        locationData.takenAt = takenAt;
      }

      if (imageUpload.locationId) {
        await prisma.location.update({
          where: { id: imageUpload.locationId },
          data: locationData,
        });
      } else {
        const newLocation = await prisma.location.create({
          data: locationData,
        });
        await prisma.imageUpload.update({
          where: { id: imageUploadId },
          data: { locationId: newLocation.id },
        });
      }
    }
  } catch (error) {
    console.error("Error processing image location:", error);
    // Decide if you want to re-throw or handle gracefully
  }
}
