import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentMember } from "@/lib/session";
import { createRequestWithMatches } from "@/lib/matching";

const schema = z.object({
  text: z.string().min(5, "Tell us a bit more about what you need").max(2000),
});

export async function POST(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const request = await createRequestWithMatches(member.id, member.communityId, parsed.data.text);
  return NextResponse.json({ request });
}
