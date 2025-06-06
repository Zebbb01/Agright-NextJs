// src/app/api/services/mapService.ts
import { prisma } from '@/lib/prisma';

export async function getAllLocationsWithImages() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        imageUploads: {
          select: {
            secureUrl: true, // Only fetch the secureUrl for the image
            publicId: true, // Include publicId if needed for image management
          },
        },
      },
    });

    // You might want to transform the data here to fit your MapPanel's expected format
    // For example, ensuring each location has at least one image URL or a default.
    return locations.map((location) => ({
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      farmName: location.farmName,
      terrain: location.terrain,
      typeOfDisease: location.typeOfDisease,
      blocks: location.blocks,
      // Take the first image's secureUrl, or provide a fallback if no images
      image: location.imageUploads.length > 0 ? location.imageUploads[0].secureUrl : "/placeholder-image.jpg", // Add a placeholder image path
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations.");
  }
}

export async function getLocationByIdWithImages(id: number) {
  try {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        imageUploads: {
          select: {
            secureUrl: true,
            publicId: true,
          },
        },
      },
    });

    if (!location) {
      return null;
    }

    return {
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      farmName: location.farmName,
      terrain: location.terrain,
      typeOfDisease: location.typeOfDisease,
      blocks: location.blocks,
      image: location.imageUploads.length > 0 ? location.imageUploads[0].secureUrl : "/placeholder-image.jpg",
    };
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error);
    throw new Error(`Failed to fetch location with ID ${id}.`);
  }
}