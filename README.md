# Connector

A working prototype of a trusted-network referral and mentorship matching
platform: members ask for help in plain language, an AI parses the request
and ranks the best-matched people in their network, and completed
interactions build a visible reputation over time.

## Stack

- **Next.js 14** (App Router, TypeScript) — pages, API routes, and server
  components in one app.
- **SQLite via Prisma** — zero-config local database; the schema is generic
  enough to point at Postgres later by changing the `datasource` provider.
- **Claude (Anthropic API)** — parses free-text asks into structured fields
  and ranks the member directory against each request. Falls back to a
  deterministic keyword-based parser/ranker if no API key is configured, so
  the whole app still works out of the box.
- **iron-session + bcrypt** — simple cookie-based email/password auth.
- **Tailwind CSS** — mobile-responsive UI.

## Core loop

1. **Ask** — a member types a request in plain language on their dashboard.
   This covers requests for help (intros, resume review, mentorship, etc.)
   as well as two opportunity-style asks: looking for or hiring for gig/
   freelance work, and posting an open role ("dropping a role") for the
   network to fill or refer into.
2. **Get connected** — Claude parses the request (company / industry /
   function / intent) and ranks the community directory against it,
   returning a short list of matches with a natural-language reason each.
   Matching considers each member's own job *and* their listed
   relationships (see below), plus their "open to new roles" / "open to
   gig work" signals for opportunity-style asks. Only the matched members
   see the request (it shows up in their dashboard's "Requests for you").
3. **Get help** — a matched member accepts or declines (opportunity-style
   requests show "I'm interested" / "Not for me" instead); accepting opens
   a simple message thread with the requester.
4. **Say what happened** — the requester logs an outcome (helped / didn't
   work out / no response) with an optional 1-5 star rating and comment.
5. **Earn credit** — responding and being positively reviewed earns points;
   crossing point thresholds unlocks a visible badge tier (e.g. "Trusted
   Connector") shown on a member's profile and in the nav bar.

### Relationships, not just employers

At signup and on their profile, members can optionally list places they
have a **solid personal relationship** — not necessarily their own
employer (e.g. "Google" because a close friend works there, or "DC policy
circles"). A LinkedIn URL is also optional. When a request names a company
or industry, a member with a matching relationship is usually the single
best match for a warm intro, even if their own job is unrelated — the
match reason calls this out explicitly (e.g. "Jordan doesn't work at
Google but has a relationship there.").

## Data model

See `prisma/schema.prisma`. Everything is scoped under a `Community` so the
same deployment can host multiple independent trusted networks — nothing is
hardcoded to one group. SQLite has no native enum type, so enum-like fields
(help category, compensation type, request intent/status, match status,
review outcome, credit reason) are stored as validated strings; the allowed
values live in `src/lib/enums.ts`.

## Getting started

```bash
npm install
cp .env.example .env      # fill in ANTHROPIC_API_KEY if you have one
npx prisma migrate dev    # creates prisma/dev.db and applies the schema
npm run dev
```

Open http://localhost:3000. The migration step seeds a demo community
("Riverside Alumni Network") with a handful of members — log in as any of
them with password `password123`:

- `jordan@example.com` — healthcare data strategy, offers intros
- `priya@example.com` — public policy, offers resume review + mentorship
- `marcus@example.com` — engineering manager, offers mock interviews
- `sasha@example.com` — VP of product, offers mentorship (barter)
- `david@example.com` — startup founder, offers intros (has a sample
  completed request already in his history)
- `emily@example.com` — HR, offers resume review + mock interviews
- `admin@example.com` — flagged as a community admin, see `/admin`

Or sign up as a brand-new member and start (or join) a community from the
signup form.

### Using the real AI matching

Without `ANTHROPIC_API_KEY` set, parsing and ranking use a deterministic
keyword-based fallback (clearly flagged in the admin view). Set the key in
`.env` to use Claude for both steps — see `src/lib/claude.ts`.

## Project layout

```
prisma/schema.prisma       Data model (includes Relationship, open-to-work flags)
prisma/seed.ts             Demo community + members + sample requests (help + opportunity)
src/lib/claude.ts          Claude parsing + ranking, with heuristic fallback
src/lib/matching.ts        Orchestrates parse -> rank -> persist Request/Match
src/lib/credit.ts          Points ledger + badge tier logic
src/lib/session.ts         iron-session cookie auth helpers
src/app/dashboard          Ask bar, "requests for you", "your asks"
src/app/requests/[id]      Request detail: matches, accept/decline, thread, review
src/app/profile/[id]       Public profile: badge, offerings, help history
src/app/profile/edit       Edit profile + manage what you offer to help with
src/app/admin              Admin view of all requests, AI parsing, match status
```

## Notes / known limitations (prototype scope)

- No payment processing — `compensation` (free / barter / tip / paid) is
  just a status field on each offering, as specified.
- Auth is intentionally minimal (email + password, no email verification,
  no password reset) — fine for a prototype, not for production.
- The admin view is scoped to the logged-in admin's own community.
- `npm audit` flags a couple of advisories in the pinned Next.js/PostCSS
  versions (mostly around `next/image` and custom-server deployments, which
  this prototype doesn't use); worth revisiting before any real deployment.
