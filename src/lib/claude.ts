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
    company: null,
    industry,
    function: fn,
    intent,
    summary: rawText.length > 140 ? rawText.slice(0, 137) + "..." : rawText,
  };
}

// --- 2. Rank directory members against a parsed request --------------------

export interface CandidateMember {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  industry: string | null;
  bio: string | null;
  offerings: { category: HelpCategory; compensation: CompensationType; notes: string | null }[];
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
    offers: c.offerings.map((o) => ({ category: o.category, compensation: o.compensation, notes: o.notes })),
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
          content: `A member submitted this request to a trusted professional referral network:\n\nRequest: "${rawText}"\nParsed intent: ${parsed.intent}\nParsed industry: ${parsed.industry ?? "unspecified"}\nParsed function: ${parsed.function ?? "unspecified"}\nParsed company: ${parsed.company ?? "unspecified"}\n\nHere is the member directory (excluding the requester) as JSON:\n${JSON.stringify(directory, null, 2)}\n\nSelect and rank the top ${limit} members who could best help with this request, considering their industry, title, company, bio, and what they've offered to help with. Only include genuinely plausible matches.`,
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

    if (parsed.industry && c.industry && c.industry.toLowerCase().includes(parsed.industry.toLowerCase())) {
      score += 0.35;
      reasons.push(`works in ${c.industry}`);
    }
    if (parsed.company && c.company && c.company.toLowerCase().includes(parsed.company.toLowerCase())) {
      score += 0.35;
      reasons.push(`is at ${c.company}`);
    }
    if (parsed.function) {
      const fn = parsed.function.toLowerCase();
      if ((c.title && c.title.toLowerCase().includes(fn)) || (c.bio && c.bio.toLowerCase().includes(fn))) {
        score += 0.2;
        reasons.push(`has ${parsed.function} experience`);
      }
    }
    for (const word of text.split(/\s+/)) {
      if (word.length > 4 && ((c.bio && c.bio.toLowerCase().includes(word)) || (c.title && c.title.toLowerCase().includes(word)))) {
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
