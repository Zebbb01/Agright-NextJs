// src/app/api/routes/image-upload/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      public_id,
      secure_url,
      format,
      width,
      height,
      resource_type,
      original_filename,
      exifData, // This is the raw JSON object from Cloudinary, or undefined/null
    } = body;

    if (!public_id || !secure_url) {
      return NextResponse.json(
        { message: 'Missing Cloudinary public_id or secure_url' },
        { status: 400 }
      );
    }

    // Create the ImageUpload record WITHOUT creating a Location
    // The Location will be created later when the form is submitted
    const imageUpload = await prisma.imageUpload.create({
      data: {
        publicId: public_id,
        secureUrl: secure_url,
        format: format,
        width: width,
        height: height,
        resourceType: resource_type,
        originalFilename: original_filename,
        exifData: exifData || null,
        // No location connection here - will be created during form submission
      },
    });

    console.log("ImageUpload created without location, will be linked during form submission");

    return NextResponse.json({ 
      imageUpload,
      message: "Image uploaded successfully. Location will be created when form is submitted."
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving image upload details:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}