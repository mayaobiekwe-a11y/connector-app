import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const communities = await prisma.community.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json({ communities });
}
