import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const options = await prisma.formOption.findMany();
  return NextResponse.json(options);
}

export async function POST(req: Request) {
  const body = await req.json();
  const option = await prisma.formOption.create({ data: body });
  return NextResponse.json(option);
}
