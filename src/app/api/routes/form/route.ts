// src/app/api/routes/form/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/helpers/errorHandler";

export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      where: {
        deletedAt: null, // Only fetch forms that are not soft-deleted
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(forms);
  } catch (error: any) {
    return handleApiError(error, "fetch all forms");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const form = await prisma.form.create({ data: body });
    return NextResponse.json(form, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "create form");
  }
}