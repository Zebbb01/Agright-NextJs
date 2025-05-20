import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // Import mkdir
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('API Error: No file uploaded in the request.');
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Define the upload directory within the public folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure the upload directory exists
    // The `recursive: true` option will create parent directories if they don't exist
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log(`Upload directory ensured: ${uploadDir}`);
    } catch (dirError: any) {
      if (dirError.code !== 'EEXIST') { // Ignore error if directory already exists
        console.error('API Error: Failed to create upload directory:', dirError);
        return NextResponse.json({ error: 'Failed to prepare upload directory.' }, { status: 500 });
      }
    }

    // Generate a unique filename to prevent clashes
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`; // Sanitize filename
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log(`[API] File saved to: ${filePath}`);

    const fileUrl = `/uploads/${filename}`;
    console.log(`[API] Generated public URL: ${fileUrl}`);
    console.log(`[API] Sending JSON response:`, { url: fileUrl, filename: file.name }); // Add this log

    return NextResponse.json({ url: fileUrl, filename: file.name });
  } catch (error: any) {
    console.error('API Error: Failed to handle file upload request:', error);
    // Ensure you're returning a JSON error even on server-side exceptions
    return NextResponse.json(
      { error: 'Failed to upload file.', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}