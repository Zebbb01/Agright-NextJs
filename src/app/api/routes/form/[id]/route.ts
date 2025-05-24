import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const form = await prisma.form.findUnique({
    where: { id: parseInt(params.id) },
    include: { options: true },
  });
  return NextResponse.json(form);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const formIdString = params.id; // This will be a string from the URL segment

  // Convert the string ID to a number
  const formId = parseInt(formIdString, 10);

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