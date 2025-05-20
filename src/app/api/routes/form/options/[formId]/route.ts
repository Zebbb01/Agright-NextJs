import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { formId: string } }
) {
  const options = await prisma.formOption.findMany({
    where: { formId: parseInt(params.formId) },
  });
  return NextResponse.json(options);
}
