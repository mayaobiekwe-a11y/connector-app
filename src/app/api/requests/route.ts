import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentMember } from "@/lib/session";
import { createRequestWithMatches } from "@/lib/matching";
import { ensureMonthlyRefresh, getAskCreditBalance, awardAskCredits, ASK_COST } from "@/lib/askCredits";

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

  await ensureMonthlyRefresh(member.id);
  const balance = await getAskCreditBalance(member.id);
  if (balance < ASK_COST) {
    return NextResponse.json(
      {
        error:
          "You're out of ask credits. Respond to a request or help someone to earn more, or wait for next month's refresh.",
      },
      { status: 402 }
    );
  }

  const request = await createRequestWithMatches(member.id, member.communityId, parsed.data.text);
  await awardAskCredits(member.id, "ASK_SPENT", request.id);

  return NextResponse.json({ request });
}
