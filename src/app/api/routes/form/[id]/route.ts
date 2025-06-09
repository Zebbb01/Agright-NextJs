import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation"; // Import validateId
import { handleApiError } from "@/lib/helpers/errorHandler"; // Import handleApiError

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const validation = validateId(params.id, "Form ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const formId = validation.id;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { options: true },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error: any) {
    return handleApiError(error, "fetch form");
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const validation = validateId(params.id, "Form ID");
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