import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const form = await prisma.form.findUnique({
    where: { id: parseInt(params.id) },
    include: { options: true },
  });
  return NextResponse.json(form);
}
