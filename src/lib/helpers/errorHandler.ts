// lib/helpers/errorHandler.ts (or similar)
import { NextResponse } from "next/server";

export function handleApiError(
  error: any,
  contextMessage: string,
  statusCode: number = 500
) {
  console.error(`API Error: ${contextMessage}`, error);

  let errorMessage = `Failed to ${contextMessage.toLowerCase()}`;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    errorMessage = (error as any).message;
  }


  if (error.code === "P2025") {
    // Prisma error code for record not found
    statusCode = 404;
    errorMessage = "Resource not found.";
  }

  return NextResponse.json(
    { error: errorMessage, details: error.message || 'Unknown error' },
    { status: statusCode }
  );
}
