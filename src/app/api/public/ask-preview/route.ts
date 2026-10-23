import { NextResponse } from "next/server";
import { z } from "zod";
import { parseAskRequest } from "@/lib/claude";

const schema = z.object({
  text: z.string().trim().min(5, "Tell us a bit more about what you need").max(500),
});

// Public, unauthenticated — this is the interactive box on the homepage.
// Deliberately only runs the parse step (what Mobi understood), never the
// ranking step: ranking reads the member directory, and an anonymous
// visitor shouldn't get results back from a private network they haven't
// joined. The actual match happens after they sign up (see the signup
// route, which fires their real ask once they have an account).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { parsed: result } = await parseAskRequest(parsed.data.text);

  return NextResponse.json({
    summary: result.summary,
    intent: result.intent,
    industry: result.industry,
    function: result.function,
  });
}
