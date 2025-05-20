import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const forms = await prisma.form.findMany({
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const body = await req.json();
  const form = await prisma.form.create({ data: body });
  return NextResponse.json(form);
}
