import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/helpers/errorHandler";

export async function GET() {
  try {
    const archivedForms = await prisma.form.findMany({
      where: {
        deletedAt: {
          not: null, // Fetch forms where deletedAt is not null
        },
      },
      orderBy: { deletedAt: "desc" }, // Order by deletion date
    });
    return NextResponse.json(archivedForms);
  } catch (error: any) {
    return handleApiError(error, "fetch archived forms");
  }
}