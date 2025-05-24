// src/app/api/routes/form/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const forms = await prisma.form.findMany({
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const body = await req.json();
  const form = await prisma.form.create({ data: body });
  return NextResponse.json(form);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const formIdString = url.searchParams.get('id');

  if (!formIdString) {
    return new NextResponse('Form ID is required', { status: 400 });
  }

  // Convert the string ID to a number
  const formId = parseInt(formIdString, 10);

  // Check if the conversion was successful
  if (isNaN(formId)) {
    return new NextResponse('Invalid Form ID', { status: 400 });
  }

  try {
    await prisma.form.delete({
      where: { id: formId }, // Now 'id' is a number
    });
    return new NextResponse('Form deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting form:', error);
    return new NextResponse('Failed to delete form', { status: 500 });
  }
}