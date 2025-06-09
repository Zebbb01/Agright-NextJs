// lib/helpers/validation.ts (or similar)
import { NextResponse } from "next/server";

export function validateId(idParam: string, paramName: string) {
  const parsedId = parseInt(idParam, 10);
  if (isNaN(parsedId)) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: `Invalid ${paramName}` },
        { status: 400 }
      ),
    };
  }
  return { isValid: true, id: parsedId };
}