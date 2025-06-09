import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/helpers/errorHandler"; // Import handleApiError

export async function GET() {
  try {
    const options = await prisma.formOption.findMany();
    return NextResponse.json(options);
  } catch (error: any) {
    return handleApiError(error, "fetch all form options");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // You might want to add validation for the 'body' content here
    // using a similar approach to validateFormValues or a new helper
    const option = await prisma.formOption.create({ data: body });
    return NextResponse.json(option, { status: 201 }); // 201 Created is often preferred for POST
  } catch (error: any) {
    return handleApiError(error, "create form option");
  }
}