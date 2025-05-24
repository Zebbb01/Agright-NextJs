// src/app/api/routes/cloudinary-sign/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Use NEXT_PUBLIC for consistency if needed, but often CLOUDINARY_CLOUD_NAME is sufficient
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paramsToSign } = body;

    // Generate a signature based on the provided parameters
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinary.config().api_secret as string
    );

    return NextResponse.json({ signature });
  } catch (error: any) {
    console.error('API Error: Failed to generate Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature.', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}