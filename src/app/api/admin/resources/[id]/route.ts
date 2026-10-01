import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await prisma.resource.deleteMany({
    where: { id: params.id, communityId: admin.communityId },
  });
  if (result.count === 0) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
