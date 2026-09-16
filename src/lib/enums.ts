// Source of truth for the enum-like string fields stored in SQLite
// (which has no native enum type). Keep in sync with the comments in
// prisma/schema.prisma.

export const HELP_CATEGORIES = [
  "INTRO_REFERRAL",
  "RESUME_REVIEW",
  "COFFEE_CHAT",
  "MOCK_INTERVIEW",
  "MENTORSHIP",
  "PAID_CONSULTING",
] as const;
export type HelpCategory = (typeof HELP_CATEGORIES)[number];

export const COMPENSATION_TYPES = ["FREE", "BARTER", "TIP", "PAID"] as const;
export type CompensationType = (typeof COMPENSATION_TYPES)[number];

export const REQUEST_INTENTS = [
  "SPECIFIC_ROLE",
  "INFORMATIONAL_CHAT",
  "EXPLORING_PIVOT",
  "ONGOING_MENTOR",
  "GENERAL_NETWORKING",
  "BUSINESS_INTRO",
] as const;
export type RequestIntent = (typeof REQUEST_INTENTS)[number];

export const REQUEST_STATUSES = ["OPEN", "MATCHED", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const MATCH_STATUSES = ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const REQUEST_OUTCOMES = ["HELPED", "DIDNT_WORK_OUT", "NO_RESPONSE"] as const;
export type RequestOutcome = (typeof REQUEST_OUTCOMES)[number];

export const CREDIT_REASONS = [
  "RESPONDED_TO_REQUEST",
  "COMPLETED_POSITIVE",
  "COMPLETED_NEUTRAL",
  "COMPLETED_LOW",
  "DIDNT_WORK_OUT",
] as const;
export type CreditReason = (typeof CREDIT_REASONS)[number];

function isOneOf<T extends readonly string[]>(values: T, x: unknown): x is T[number] {
  return typeof x === "string" && (values as readonly string[]).includes(x);
}

export const isHelpCategory = (x: unknown): x is HelpCategory => isOneOf(HELP_CATEGORIES, x);
export const isCompensationType = (x: unknown): x is CompensationType => isOneOf(COMPENSATION_TYPES, x);
export const isRequestIntent = (x: unknown): x is RequestIntent => isOneOf(REQUEST_INTENTS, x);
