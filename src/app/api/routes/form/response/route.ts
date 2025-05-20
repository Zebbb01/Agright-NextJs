import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      where: {
        deletedAt: null, // <-- ADD THIS LINE: Filter out soft-deleted responses
      },
      orderBy: { createdAt: 'desc' } // Good to add an order here too
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error("GET all responses error:", error);
    return NextResponse.json({ error: "Failed to fetch all responses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await prisma.response.create({
      data: {
        formId: parseInt(body.formId),
        userId: body.userId, // No default user if userId is provided by auth context
        values: body.values,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("POST response error:", error);
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 });
  }
}