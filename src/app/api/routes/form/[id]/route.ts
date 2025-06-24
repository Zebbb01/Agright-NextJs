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

    // Include options when fetching a single form for editing/viewing
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { options: true }, // Include associated FormOptions
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error: any) {
    return handleApiError(error, "fetch form");
  }
}

/**
 * PUT /api/routes/form/[id]
 * Updates an existing form and its associated FormOptions.
 * This handles creating new options, updating existing ones, and deleting removed ones.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validation = validateId(params.id, "Form ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const formId = validation.id;

    const { formDetails, fields } = await req.json(); // Expecting formDetails and fields array

    if (!formDetails || typeof formDetails !== 'object' || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid request body. Expected 'formDetails' and 'fields'." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update the Form record itself
      await tx.form.update({
        where: { id: formId },
        data: {
          name: formDetails.name,
          details: formDetails.details,
          // 'date' and 'deletedAt' are typically not updated via this route
        },
      });

      // 2. Manage FormOptions (create, update, delete)
      const existingOptions = await tx.formOption.findMany({
        where: { formId: formId },
      });

      const operations = [];

      // Identify options to update or create
      for (const field of fields) {
        // Find existing option by label and type (or unique identifier if you had one)
        // For simplicity, let's assume `id` in `FormField` from the frontend is for new fields or matches existing backend IDs for updates.
        // If your frontend `FormField` `id` is just a temporary unique key (like `Date.now()`),
        // you'd need a more robust way to map them to existing backend `FormOption` records,
        // e.g., by matching `label` and `type` or by including the Prisma `id` if it's passed from the frontend.
        // For this example, we'll assume `field.id` can be used to identify existing options,
        // and if it's a new field, it won't match any existing `FormOption` ID from Prisma.
        
        // A more robust way to track updates would be to send back the Prisma `FormOption.id` from the frontend
        // when editing, and use that `id` to `update` directly. For newly added fields, `id` would be undefined
        // or a client-generated temporary ID.
        
        const existingOption = existingOptions.find(opt => String(opt.id) === String(field.id));

        if (existingOption) {
          // Update existing option
          operations.push(
            tx.formOption.update({
              where: { id: existingOption.id },
              data: {
                label: field.label,
                type: field.type,
                options: field.options || [],
                required: field.required,
              },
            })
          );
        } else {
          // Create new option
          operations.push(
            tx.formOption.create({
              data: {
                formId: Number(formId), // Ensure formId is number for Prisma
                label: field.label,
                type: field.type,
                options: field.options || [],
                required: field.required,
              },
            })
          );
        }
      }

      // Identify options to delete
      const incomingFieldIds = fields.map((f: any) => String(f.id));
      for (const existingOption of existingOptions) {
        if (!incomingFieldIds.includes(String(existingOption.id))) {
          // If an existing option's ID is not in the incoming fields, delete it
          operations.push(
            tx.formOption.delete({
              where: { id: existingOption.id },
            })
          );
        }
      }

      await Promise.all(operations);
    });

    return NextResponse.json({ message: "Form and options updated successfully" }, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, "update form and options");
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
