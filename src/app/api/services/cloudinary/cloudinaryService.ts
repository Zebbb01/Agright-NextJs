/**
 * New service to get a Cloudinary signature
 * @param paramsToSign Parameters to sign for Cloudinary upload.
 * @returns A promise that resolves to an object containing the Cloudinary signature.
 * @throws Error if obtaining the signature fails.
 */
export const getCloudinarySignature = async (
  paramsToSign: Record<string, any>
): Promise<{ signature: string }> => {
  const response = await fetch("/api/routes/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to get Cloudinary signature: ${
        errorData.details || response.statusText
      }`
    );
  }
  return response.json();
};

/**
 * Uploads a file to Cloudinary and saves its details to your backend.
 * @param file The file to upload.
 * @param formResponseValues The current form data to associate with the image.
 * @returns A promise that resolves to the saved ImageUpload record from your DB.
 * @throws Error if the upload fails.
 */
export const uploadFileToCloudinaryService = async (
  file: File,
  formResponseValues?: Record<string, any> // Add formResponseValues parameter
): Promise<{
  id: number;
  publicId: string;
  secureUrl: string;
  exifData?: any;
  takenAt?: string; // Add takenAt to the return type for the hook
}> => {
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary environment variables not set.");
  }

  const uploadParams: Record<string, any> = {
    folder: "form_uploads",
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
    timestamp: Math.round(new Date().getTime() / 1000),
  };

  const formData = new FormData();
  formData.append("file", file);
  for (const key in uploadParams) {
    formData.append(key, uploadParams[key]);
  }

  const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const uploadRes = await fetch(cloudinaryUploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    console.error("Cloudinary upload failed:", errorData);
    throw new Error(
      `Cloudinary upload failed: ${
        errorData.error?.message || uploadRes.statusText
      }`
    );
  }

  const cloudinaryData = await uploadRes.json();

  const saveToDbRes = await fetch("/api/routes/image-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_id: cloudinaryData.public_id,
      secure_url: cloudinaryData.secure_url,
      format: cloudinaryData.format,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      resource_type: cloudinaryData.resource_type,
      original_filename: cloudinaryData.original_filename,
      exifData: cloudinaryData.image_metadata,
      formResponseValues: formResponseValues,
    }),
  });

  if (!saveToDbRes.ok) {
    const errorData = await saveToDbRes.json();
    console.error("Failed to save image upload details to DB:", errorData);
    throw new Error(
      `Failed to save image upload details to database: ${
        errorData.details || saveToDbRes.statusText
      }`
    );
  }

  const savedImageUpload = await saveToDbRes.json();
  return {
    id: savedImageUpload.imageUpload.id,
    publicId: savedImageUpload.imageUpload.publicId,
    secureUrl: savedImageUpload.imageUpload.secureUrl,
    exifData: savedImageUpload.imageUpload.exifData,
    takenAt: savedImageUpload.imageUpload.location?.takenAt,
  };
};