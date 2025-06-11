// src/app/api/routes/form/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation";
import { handleApiError } from "@/lib/helpers/errorHandler";

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

// PERMANENTLY DELETE a Form
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validation = validateId(params.id, "Form ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const formId = validation.id;

    // PERFORM HARD DELETE
    await prisma.form.delete({
      where: { id: formId },
    });
    return new NextResponse("Form permanently deleted successfully", { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "permanently delete form");
  }
}

// RESTORE or SOFT DELETE a Form
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validation = validateId(params.id, "Form ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const formId = validation.id;

    const body = await req.json();

    // Handle restore action
    if (body.action === "restore") {
      await prisma.form.update({
        where: { id: formId },
        data: {
          deletedAt: null, // Set deletedAt to null to restore
        },
      });
      return new NextResponse("Form restored successfully", { status: 200 });
    }

    // Handle soft-delete action (move to archive)
    if (body.action === "soft-delete") {
        await prisma.form.update({
            where: { id: formId },
            data: {
                deletedAt: new Date(), // Set deletedAt to current date for soft delete
            },
        });
        return new NextResponse("Form soft-deleted successfully", { status: 200 });
    }

    // If neither restore nor soft-delete, it's an invalid action for this PATCH route
    return new NextResponse("Invalid action for form PATCH", { status: 400 });
  } catch (error: any) {
    return handleApiError(error, "update form or restore form");
  }
}