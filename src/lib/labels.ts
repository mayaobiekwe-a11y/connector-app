// Human-readable labels for Prisma enums, kept in one place for the UI.

export const HELP_CATEGORY_LABELS: Record<string, string> = {
  INTRO_REFERRAL: "Intro / Referral",
  RESUME_REVIEW: "Resume Review",
  COFFEE_CHAT: "Coffee Chat",
  MOCK_INTERVIEW: "Mock Interview",
  MENTORSHIP: "Mentorship",
  PAID_CONSULTING: "Paid Consulting",
};

export const COMPENSATION_LABELS: Record<string, string> = {
  FREE: "Free",
  BARTER: "Barter",
  TIP: "Tip-based",
  PAID: "Paid",
};

export const INTENT_LABELS: Record<string, string> = {
  SPECIFIC_ROLE: "Applying for a specific role",
  INFORMATIONAL_CHAT: "Informational chat",
  EXPLORING_PIVOT: "Exploring a career pivot",
  ONGOING_MENTOR: "Looking for an ongoing mentor",
  GENERAL_NETWORKING: "General networking",
  BUSINESS_INTRO: "Business introduction",
  SEEKING_GIG_WORK: "Looking for gig/freelance work",
  HIRING_GIG_WORK: "Hiring for a gig/project",
  JOB_OPENING: "Posting a job opening",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  MATCHED: "Matched",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting response",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

export const OUTCOME_LABELS: Record<string, string> = {
  HELPED: "Helped",
  DIDNT_WORK_OUT: "Didn't work out",
  NO_RESPONSE: "No response",
};
