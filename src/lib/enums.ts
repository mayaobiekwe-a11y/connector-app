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

// GENERAL: a normal member. SERVICE_PROVIDER: an individual or business
// offering paid services to the community, gated by a subscription.
export const PROFILE_TYPES = ["GENERAL", "SERVICE_PROVIDER"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];

// Only meaningful when profileType is SERVICE_PROVIDER. This is a status
// flag set manually for the prototype — no real billing integration.
export const SUBSCRIPTION_STATUSES = ["NONE", "ACTIVE", "INACTIVE"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const REQUEST_INTENTS = [
  "SPECIFIC_ROLE",
  "INFORMATIONAL_CHAT",
  "EXPLORING_PIVOT",
  "ONGOING_MENTOR",
  "GENERAL_NETWORKING",
  "BUSINESS_INTRO",
  "SEEKING_GIG_WORK", // requester wants freelance/contract/paid project work for themselves
  "HIRING_GIG_WORK", // requester needs to hire someone for freelance/contract work
  "JOB_OPENING", // requester is posting an open role at their company for others to fill/refer
] as const;
export type RequestIntent = (typeof REQUEST_INTENTS)[number];

// Intents where the requester is distributing an opportunity (a role or gig
// to fill) rather than asking for help — matched members are being asked
// "are you interested / do you know someone?" rather than "can you help?".
export const OPPORTUNITY_INTENTS: RequestIntent[] = ["HIRING_GIG_WORK", "JOB_OPENING"];
export const isOpportunityIntent = (intent: string | null | undefined): boolean =>
  !!intent && (OPPORTUNITY_INTENTS as string[]).includes(intent);

export const REQUEST_STATUSES = ["OPEN", "MATCHED", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const MATCH_STATUSES = ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

// AI_MATCH: suggested by the ranking pipeline and privately notified.
// VOLUNTEER: a member self-selected from the public community feed.
export const MATCH_SOURCES = ["AI_MATCH", "VOLUNTEER"] as const;
export type MatchSource = (typeof MATCH_SOURCES)[number];

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

// Reasons for ask-credit ledger entries (see src/lib/askCredits.ts). Positive
// amounts earn credits, negative amounts spend them.
export const ASK_CREDIT_REASONS = [
  "SIGNUP_BONUS",
  "MONTHLY_REFRESH",
  "ASK_SPENT",
  "RESPONDED_TO_REQUEST",
  "COMPLETED_POSITIVE",
] as const;
export type AskCreditReason = (typeof ASK_CREDIT_REASONS)[number];

function isOneOf<T extends readonly string[]>(values: T, x: unknown): x is T[number] {
  return typeof x === "string" && (values as readonly string[]).includes(x);
}

export const isHelpCategory = (x: unknown): x is HelpCategory => isOneOf(HELP_CATEGORIES, x);
export const isCompensationType = (x: unknown): x is CompensationType => isOneOf(COMPENSATION_TYPES, x);
export const isRequestIntent = (x: unknown): x is RequestIntent => isOneOf(REQUEST_INTENTS, x);
