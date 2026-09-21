import Anthropic from "@anthropic-ai/sdk";
import { REQUEST_INTENTS, type HelpCategory, type CompensationType, type RequestIntent } from "./enums";

const MODEL = "claude-sonnet-5";

const INTENT_VALUES: RequestIntent[] = [...REQUEST_INTENTS];

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export interface ParsedRequest {
  company: string | null;
  industry: string | null;
  function: string | null;
  intent: RequestIntent;
  summary: string;
}

export interface ParseResult {
  parsed: ParsedRequest;
  raw: string;
  usedFallback: boolean;
  error?: string;
}

// --- 1. Parse a free-text ask into structured fields -----------------------

export async function parseAskRequest(rawText: string): Promise<ParseResult> {
  const client = getClient();
  if (!client) {
    return {
      parsed: heuristicParse(rawText),
      raw: JSON.stringify({ fallback: "no-api-key" }),
      usedFallback: true,
    };
  }

  const tool: Anthropic.Tool = {
    name: "record_parsed_request",
    description:
      "Record the structured interpretation of a member's help request in a professional referral network.",
    input_schema: {
      type: "object",
      properties: {
        company: {
          type: ["string", "null"],
          description: "A specific company named or clearly implied, otherwise null.",
        },
        industry: {
          type: ["string", "null"],
          description:
            "The industry or sector relevant to the request (e.g. 'healthcare', 'public policy', 'fintech'), otherwise null.",
        },
        function: {
          type: ["string", "null"],
          description:
            "The job function or domain area involved (e.g. 'product management', 'resume review', 'public policy'), otherwise null.",
        },
        intent: {
          type: "string",
          enum: INTENT_VALUES,
          description: "The single best-fitting category of what the requester wants.",
        },
        summary: {
          type: "string",
          description: "A short, one-sentence plain-language paraphrase of the request.",
        },
      },
      required: ["intent", "summary"],
    },
  };

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      tools: [tool],
      tool_choice: { type: "tool", name: "record_parsed_request" },
      messages: [
        {
          role: "user",
          content: `A member of a trusted professional referral network submitted this help request:\n\n"${rawText}"\n\nExtract the structured fields for it.`,
        },
      ],
    });

    const toolUse = msg.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) throw new Error("No tool_use block in Claude response");

    const input = toolUse.input as Record<string, unknown>;
    const intent = INTENT_VALUES.includes(input.intent as RequestIntent)
      ? (input.intent as RequestIntent)
      : "GENERAL_NETWORKING";

    const parsed: ParsedRequest = {
      company: (input.company as string) || null,
      industry: (input.industry as string) || null,
      function: (input.function as string) || null,
      intent,
      summary: (input.summary as string) || rawText.slice(0, 140),
    };

    return { parsed, raw: JSON.stringify(input), usedFallback: false };
  } catch (err) {
    return {
      parsed: heuristicParse(rawText),
      raw: JSON.stringify({ error: String(err) }),
      usedFallback: true,
      error: String(err),
    };
  }
}

// Deterministic keyword-based fallback so the prototype works without an
// ANTHROPIC_API_KEY configured, and stays functional if the API errors.
function heuristicParse(rawText: string): ParsedRequest {
  const text = rawText.toLowerCase();

  const intentRules: Array<[RequestIntent, string[]]> = [
    ["SPECIFIC_ROLE", ["applying for", "apply to", "role at", "job at", "position at", "interview at"]],
    ["INFORMATIONAL_CHAT", ["informational", "learn more about", "chat about", "pick their brain"]],
    ["EXPLORING_PIVOT", ["pivot", "switch careers", "transition into", "break into", "considering a move"]],
    ["ONGOING_MENTOR", ["mentor", "mentorship", "ongoing guidance", "long-term advice"]],
    [
      "JOB_OPENING",
      ["we're hiring", "we are hiring", "open role", "open position", "job opening", "looking to fill", "hiring a", "hiring for a"],
    ],
    [
      "HIRING_GIG_WORK",
      ["hire a freelancer", "hire a contractor", "need a freelancer", "need a contractor", "looking to hire", "need someone to build", "contract help"],
    ],
    [
      "SEEKING_GIG_WORK",
      ["freelance work", "contract work", "gig work", "looking for freelance", "available for freelance", "freelance opportunities", "freelance gigs", "side project", "moonlight"],
    ],
    ["BUSINESS_INTRO", ["client", "partnership", "vendor", "business intro", "sell to", "invest in"]],
  ];
  let intent: RequestIntent = "GENERAL_NETWORKING";
  for (const [candidateIntent, keywords] of intentRules) {
    if (keywords.some((k) => text.includes(k))) {
      intent = candidateIntent;
      break;
    }
  }

  const industryKeywords = [
    "healthcare", "fintech", "finance", "education", "edtech", "public policy",
    "government", "nonprofit", "tech", "software", "biotech", "climate",
    "energy", "media", "retail", "consulting", "legal", "real estate",
  ];
  const industry = industryKeywords.find((k) => text.includes(k)) ?? null;

  const functionKeywords = [
    "resume review", "mock interview", "product management", "engineering",
    "marketing", "sales", "data science", "design", "operations", "hr",
    "human resources", "public policy", "research", "finance", "strategy",
  ];
  const fn = functionKeywords.find((k) => text.includes(k)) ?? null;

  return {
    company: extractCompany(rawText),
    industry,
    function: fn,
    intent,
    summary: rawText.length > 140 ? rawText.slice(0, 137) + "..." : rawText,
  };
}

// Naive proper-noun extraction for "at/with/from <Company>" phrasing. Good
// enough for a fallback parser; Claude does the real extraction otherwise.
const COMPANY_STOPWORDS = new Set([
  "I", "We", "They", "He", "She", "It", "This", "That", "Who", "What",
  "Where", "When", "Please", "Thanks", "My", "Our", "The", "A",
]);
function extractCompany(rawText: string): string | null {
  const match = rawText.match(/\b(?:at|with|from)\s+([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,2})/);
  if (!match) return null;
  const words = match[1].split(/\s+/).filter((w) => !COMPANY_STOPWORDS.has(w));
  return words.length > 0 ? words.join(" ") : null;
}

// --- 2. Rank directory members against a parsed request --------------------

export interface CandidateMember {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  industry: string | null;
  bio: string | null;
  openToRoles: boolean;
  openToGigWork: boolean;
  offerings: { category: HelpCategory; compensation: CompensationType; notes: string | null }[];
  // Places this member has a solid personal relationship (not necessarily
  // their own employer) — e.g. "Google", "DC policy circles". The single
  // strongest signal for warm-intro-style requests naming a company/industry.
  relationships: { label: string; notes: string | null }[];
  // Businesses/projects this member is building outside their day job. For
  // requests about that space, this can matter more than their actual job.
  sideHustles: { name: string; description: string | null }[];
}

export interface RankedMatch {
  memberId: string;
  score: number;
  reason: string;
}

export async function rankMatches(
  rawText: string,
  parsed: ParsedRequest,
  candidates: CandidateMember[],
  limit = 5
): Promise<{ matches: RankedMatch[]; usedFallback: boolean }> {
  if (candidates.length === 0) return { matches: [], usedFallback: false };

  const client = getClient();
  if (!client) {
    return { matches: heuristicRank(rawText, parsed, candidates, limit), usedFallback: true };
  }

  const tool: Anthropic.Tool = {
    name: "record_ranked_matches",
    description: "Record the best-matched members for a help request, ranked best first.",
    input_schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          description: `Up to ${limit} best-matched members, ranked best first. Omit anyone who is a poor fit.`,
          items: {
            type: "object",
            properties: {
              memberId: { type: "string" },
              score: {
                type: "number",
                description: "Relevance score from 0 (poor fit) to 1 (excellent fit).",
              },
              reason: {
                type: "string",
                description:
                  "One short, specific, natural-language sentence explaining why this person is a good match, written for the requester (e.g. \"Jordan works in healthcare data strategy and has offered to help with intros.\").",
              },
            },
            required: ["memberId", "score", "reason"],
          },
        },
      },
      required: ["matches"],
    },
  };

  const directory = candidates.map((c) => ({
    memberId: c.id,
    name: c.name,
    title: c.title,
    company: c.company,
    industry: c.industry,
    bio: c.bio,
    openToNewRoles: c.openToRoles,
    openToGigWork: c.openToGigWork,
    offers: c.offerings.map((o) => ({ category: o.category, compensation: o.compensation, notes: o.notes })),
    relationships: c.relationships.map((r) => ({ where: r.label, notes: r.notes })),
    sideHustles: c.sideHustles.map((s) => ({ name: s.name, description: s.description })),
  }));

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [tool],
      tool_choice: { type: "tool", name: "record_ranked_matches" },
      messages: [
        {
          role: "user",
          content: `A member submitted this request to a trusted professional referral network:\n\nRequest: "${rawText}"\nParsed intent: ${parsed.intent}\nParsed industry: ${parsed.industry ?? "unspecified"}\nParsed function: ${parsed.function ?? "unspecified"}\nParsed company: ${parsed.company ?? "unspecified"}\n\nHere is the member directory (excluding the requester) as JSON:\n${JSON.stringify(directory, null, 2)}\n\nSelect and rank the top ${limit} members who could best help with this request, considering their industry, title, company, bio, and what they've offered to help with.\n\nEach member's "relationships" list is where they have a solid personal connection — not necessarily their own employer (e.g. a member at a nonprofit might list "Google" because a close friend works there). If the request names a specific company or industry, a member with a matching relationship is usually the single best match, even if their own job is unrelated — call this out explicitly in the reason (e.g. "Dana doesn't work at Acme but has a close contact there.").\n\nA member's "sideHustles" are businesses or projects they run outside their day job — their day job may just pay the bills while the side hustle is their actual area of expertise or passion. For a request in that space, treat a matching side hustle as at least as strong a signal as their job title (e.g. someone with a day job in accounting but a side hustle as a wedding photographer is a great match for a photography request).\n\nIf the parsed intent is JOB_OPENING or HIRING_GIG_WORK, the requester is distributing an opportunity, not asking for help — prioritize members flagged openToNewRoles (for JOB_OPENING) or openToGigWork (for HIRING_GIG_WORK) who also fit the industry/function, and phrase the reason as why they'd be interested (e.g. "Sasha is open to new product roles and has relevant experience."). If the intent is SEEKING_GIG_WORK, the requester wants freelance/contract work for themselves — prioritize members who could plausibly hire them or know of paid opportunities (founders, managers, people with relevant relationships), not members who also just want gig work.\n\nOnly include genuinely plausible matches.`,
        },
      ],
    });

    const toolUse = msg.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) throw new Error("No tool_use block in Claude response");

    const input = toolUse.input as { matches: RankedMatch[] };
    const validIds = new Set(candidates.map((c) => c.id));
    const matches = (input.matches || [])
      .filter((m) => validIds.has(m.memberId))
      .slice(0, limit);

    if (matches.length === 0) {
      return { matches: heuristicRank(rawText, parsed, candidates, limit), usedFallback: true };
    }
    return { matches, usedFallback: false };
  } catch {
    return { matches: heuristicRank(rawText, parsed, candidates, limit), usedFallback: true };
  }
}

// Common long-ish words excluded from the "distinctive shared word" side
// hustle check below, so generic phrasing doesn't manufacture false matches.
const COMMON_LONG_WORDS = new Set([
  "someone", "anybody", "anyone", "network", "connect", "connection", "connections",
  "looking", "working", "worked", "resource", "resources", "support", "question",
  "another", "helping", "something", "business", "company", "companies", "people",
  "person", "member", "members", "group", "groups", "community", "general",
]);

// Deterministic keyword/overlap scoring fallback for ranking.
function heuristicRank(
  rawText: string,
  parsed: ParsedRequest,
  candidates: CandidateMember[],
  limit: number
): RankedMatch[] {
  const text = rawText.toLowerCase();

  const scored = candidates.map((c) => {
    let score = 0.05;
    const reasons: string[] = [];

    // A listed relationship at the named company/industry beats even
    // working there yourself — it's the whole point of a warm intro.
    const matchingRelationship = c.relationships.find(
      (r) =>
        (parsed.company && r.label.toLowerCase().includes(parsed.company.toLowerCase())) ||
        (parsed.industry && r.label.toLowerCase().includes(parsed.industry.toLowerCase()))
    );
    if (matchingRelationship) {
      score += 0.5;
      reasons.push(`has a relationship at ${matchingRelationship.label}`);
    }

    if (parsed.industry && c.industry && c.industry.toLowerCase().includes(parsed.industry.toLowerCase())) {
      score += 0.35;
      reasons.push(`works in ${c.industry}`);
    }
    if (parsed.company && c.company && c.company.toLowerCase().includes(parsed.company.toLowerCase())) {
      score += 0.35;
      reasons.push(`is at ${c.company}`);
    }
    if (parsed.intent === "JOB_OPENING" && c.openToRoles) {
      score += 0.4;
      reasons.push(`is open to new roles`);
    }
    if (parsed.intent === "HIRING_GIG_WORK" && c.openToGigWork) {
      score += 0.4;
      reasons.push(`is open to gig/freelance work`);
    }
    if (
      parsed.intent === "SEEKING_GIG_WORK" &&
      c.title &&
      /founder|ceo|director|manager|lead|head of|vp/i.test(c.title)
    ) {
      score += 0.15;
      reasons.push(`may have freelance work to share in their role as ${c.title}`);
    }
    if (parsed.function) {
      const fn = parsed.function.toLowerCase();
      if ((c.title && c.title.toLowerCase().includes(fn)) || (c.bio && c.bio.toLowerCase().includes(fn))) {
        score += 0.2;
        reasons.push(`has ${parsed.function} experience`);
      }
    }
    // A matching side hustle counts at least as much as the day job — for
    // a lot of people the side hustle is the thing they actually want to
    // be known/asked for. A precise function/industry hit earns the full
    // boost; so does a fairly distinctive shared word (the request might
    // name a craft/niche, like "woodworking", that isn't in the parser's
    // fixed industry/function keyword lists at all). Looser overlap is
    // credited only via the generic word scan below.
    const matchingHustle = c.sideHustles.find((s) => {
      const haystack = `${s.name} ${s.description ?? ""}`.toLowerCase();
      if (parsed.function && haystack.includes(parsed.function.toLowerCase())) return true;
      if (parsed.industry && haystack.includes(parsed.industry.toLowerCase())) return true;
      return text
        .split(/\s+/)
        .some((word) => word.length >= 7 && !COMMON_LONG_WORDS.has(word) && haystack.includes(word));
    });
    if (matchingHustle) {
      score += 0.3;
      reasons.push(`runs ${matchingHustle.name} on the side`);
    }
    const hustleText = c.sideHustles.map((s) => `${s.name} ${s.description ?? ""}`).join(" ").toLowerCase();
    for (const word of text.split(/\s+/)) {
      if (
        word.length > 4 &&
        ((c.bio && c.bio.toLowerCase().includes(word)) ||
          (c.title && c.title.toLowerCase().includes(word)) ||
          hustleText.includes(word))
      ) {
        score += 0.02;
      }
    }
    if (c.offerings.length > 0) {
      // Only credit having offerings as a tiebreaker on top of an existing
      // relevance signal — it shouldn't by itself make someone a "match".
      score += reasons.length > 0 ? 0.1 : 0.03;
      reasons.push(`has offered to help with ${c.offerings.length > 1 ? "several things" : "this"}`);
    }

    score = Math.min(1, score);
    const reason =
      reasons.length > 0
        ? `${c.name} ${reasons.join(" and ")}.`
        : `${c.name} is an active member of the network who may be able to help.`;

    return { memberId: c.id, score, reason };
  });

  return scored
    .filter((m) => m.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
