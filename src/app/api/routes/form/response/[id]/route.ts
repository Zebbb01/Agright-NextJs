import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler for soft-deleting a response
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const responseId = parseInt(params.id);

    if (isNaN(responseId)) {
      return NextResponse.json(
        { error: "Invalid Response ID" },
        { status: 400 }
      );
    }

    // Perform a soft delete by updating the deletedAt field
    const softDeletedResponse = await prisma.response.update({
      where: { id: responseId },
      data: {
        deletedAt: new Date(), // Set the current timestamp for deletion
      },
    });

    return NextResponse.json(softDeletedResponse, { status: 200 });
  } catch (error: any) {
    console.error("API Error: Failed to soft-delete response:", error);

    // Provide more specific error messages if possible, e.g., if record not found
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { error: "Response not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to soft-delete response.",
        details: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
