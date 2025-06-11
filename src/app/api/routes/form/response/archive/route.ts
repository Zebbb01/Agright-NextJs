import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/helpers/errorHandler";
import { responseInclude } from "@/lib/constants/prismaIncludes"; // Assuming this is defined

export async function GET() {
  try {
    const archivedResponses = await prisma.response.findMany({
      where: {
        deletedAt: {
          not: null, // Fetch responses where deletedAt is not null
        },
      },
      orderBy: { deletedAt: "desc" }, // Order by deletion date
      include: responseInclude,
    });
    return NextResponse.json(archivedResponses);
  } catch (error: any) {
    return handleApiError(error, "fetch archived responses");
  }
}