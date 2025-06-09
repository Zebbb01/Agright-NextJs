// src/app/api/routes/form/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateId } from "@/lib/helpers/validation"; // Import validateId
import { handleApiError } from '@/lib/helpers/errorHandler'; // Import handleApiError

export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(forms);
  } catch (error: any) {
    return handleApiError(error, "fetch all forms");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // You might want to add validation for the 'body' content here
    const form = await prisma.form.create({ data: body });
    return NextResponse.json(form, { status: 201 }); // 201 Created is often preferred for POST
  } catch (error: any) {
    return handleApiError(error, "create form");
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const formIdString = url.searchParams.get('id');

    if (!formIdString) {
      // Use handleApiError for consistency even for simple checks
      return handleApiError(new Error('Form ID is required'), 'delete form', 400);
    }

    const validation = validateId(formIdString, "Form ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const formId = validation.id;

    await prisma.form.delete({
      where: { id: formId },
    });
    return new NextResponse('Form deleted successfully', { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "delete form");
  }
}