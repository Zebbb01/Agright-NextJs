import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = parseInt(params.formId);
    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid Form ID' }, { status: 400 });
    }

    const responses = await prisma.response.findMany({
      where: {
        formId: formId,
        deletedAt: null, // <-- ADD THIS LINE: Filter out soft-deleted responses
      },
      include: {
        user: true, // Optional, if you want user data
      },
      orderBy: { createdAt: 'desc' } // Changed to createdAt as that's a more reliable sort
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error("GET responses by formId error:", error);
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
  }
}