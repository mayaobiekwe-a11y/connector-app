# Mobi

A working prototype of a trusted-network referral and mentorship matching
platform: members ask for help in plain language, an AI parses the request
and ranks the best-matched people in their network, and completed
interactions build a visible reputation over time.

## Stack

- **Next.js 14** (App Router, TypeScript) — pages, API routes, and server
  components in one app.
- **Postgres via Prisma** — works with any Postgres (local, Neon, Supabase,
  Vercel Postgres, Railway, ...); the schema has no Postgres-specific
  features, so it'd also run on SQLite/MySQL with a one-line provider change.
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
2. **Get connected** — Claude (personified in the UI as "Mobi") parses the
   request (company / industry / function / intent) and ranks the community
   directory against it, returning a short list of matches with a
   natural-language reason each. Matching considers each member's own job
   *and* their listed relationships and side hustles (see below), plus
   their "open to new roles" / "open to gig work" signals for
   opportunity-style asks. Matched members are notified privately (it shows
   up in their dashboard's "Requests for you") — **and** the ask also
   appears on the public **community feed** (`/feed`), where any member can
   see it and volunteer to help, not just Mobi's picks. Both paths lead to
   the same accept/thread/outcome flow.
3. **Get help** — a matched member accepts or declines (opportunity-style
   requests show "I'm interested" / "Not for me" instead), or a member
   volunteers straight from the feed (an immediate commitment — no separate
   approval step); either way it opens a simple message thread with the
   requester.
4. **Say what happened** — the requester logs an outcome (helped / didn't
   work out / no response) with an optional 1-5 star rating and comment.
5. **Earn credit** — responding and being positively reviewed earns
   reputation points; crossing point thresholds unlocks a visible badge
   tier (e.g. "Trusted Connector") shown on a member's profile and in the
   nav bar. Separately, it also earns **ask credits** — see below.

### Ask credits: asking isn't free

Posting an ask costs 1 ask credit, so a member can't post an unlimited
stream of requests. Everyone starts with 3 (signup bonus), earns 1 back for
responding to any request (AI-matched or volunteered from the feed) and 2
more when they're rated 4-5 stars for actually helping, plus a small
no-cron-needed monthly top-up. Run out, and the Ask bar explains how to
earn more instead of accepting the request — the point is reciprocity:
you can keep asking as long as you're also willing to help. This is a
separate ledger (`AskCreditEntry`) from the permanent reputation points
used for badges, so spending down your ask credits never affects your
badge tier.

### Relationships, not just employers

At signup and on their profile, members can optionally list places they
have a **solid personal relationship** — not necessarily their own
employer (e.g. "Google" because a close friend works there, or "DC policy
circles"). A LinkedIn URL is also optional. When a request names a company
or industry, a member with a matching relationship is usually the single
best match for a warm intro, even if their own job is unrelated — the
match reason calls this out explicitly (e.g. "Jordan doesn't work at
Google but has a relationship there.").

### Side hustles count too

A member's day job might just pay the bills — their side hustle or passion
project can be what they actually want to be known for, and matching
treats it that way: a request about woodworking will surface someone whose
*side hustle* is woodworking even if their job title has nothing to do
with it. Side hustles (name, one-line description, optional link) are
editable on the profile page and shown prominently on both the profile and
the directory card.

### Profile types: General Member vs. Service Provider

Every member picks a profile type at signup (editable later): **General
Member**, or **Service Provider** — someone offering paid services to the
community, conceptually gated by a subscription. There's no real billing
in this prototype (see Notes below); switching to Service Provider just
flips a `subscriptionStatus` flag to `ACTIVE`. Service Providers get a
visible tag on their profile and in the directory.

### Directory + visibility + capacity

`/directory` lists every member in your community (name, photo, blurb,
side hustles, relationships, badge), with a client-side search box —
this is "profiles show in the group," made literal. Two things members
control from their profile:
- **Visible in directory** — off by default it'd defeat the point of
  joining, so it's on by default; members can opt out to stop appearing in
  the directory or the AI matching pool entirely, without deleting their
  account.
- **Monthly capacity** — an optional cap on how many requests someone
  wants to be matched to per month. Once a member has that many *accepted*
  matches in the current calendar month, matching stops suggesting them
  until the next month — so your most helpful people don't get flooded
  into unresponsiveness.

### Privacy: first names only, no LinkedIn until you're in

Members only ever see each other's **first name** (`src/lib/displayName.ts`)
— in the directory, the feed, profile pages, match lists, and thread
messages. Full names are visible only to the member themself and to admins
(who need real identities for moderation). Profile pages also don't show a
member's LinkedIn link to anyone but that member and admins. The point is
to keep enough friction that getting help actually goes through the
platform (and its credit/reputation loop) instead of "see a name on the
directory, look them up on LinkedIn, DM them directly" bypassing it
entirely.

## Data model

See `prisma/schema.prisma`. Everything is scoped under a `Community`, but the
MVP only ever uses one: every signup auto-joins the same global network
(`src/lib/community.ts`) rather than picking/creating one, since reach beyond
any single group is the point — most members are job-searching and want more
surface area, not a smaller silo. The schema still supports multiple
independent communities; exposing that as a real "create a private network"
feature is future work, not a rebuild. Enum-like fields (help category, compensation type,
request intent/status, match status, review outcome, credit reason) are
stored as validated strings rather than native Postgres enums, so adding a
new value (like the gig-work/job-opening intents) never needs a migration
that alters a type — the allowed values live in `src/lib/enums.ts`.

## Getting started (local)

You need a Postgres database to point at — a local install, or a free
hosted one (e.g. [Neon](https://neon.tech), which gives you a connection
string in under a minute with no credit card).

```bash
npm install
cp .env.example .env       # set DATABASE_URL to your Postgres connection string,
                            # and ANTHROPIC_API_KEY if you have one
npx prisma migrate deploy  # applies the schema
npx prisma db seed         # loads the global network + demo members
npm run dev
```

Open http://localhost:3000. The seed step adds a handful of demo members to
the network — log in as any of them with password `password123`:

- `jordan@example.com` — healthcare data strategy, offers intros
- `priya@example.com` — public policy, offers resume review + mentorship
- `marcus@example.com` — engineering manager, offers mock interviews
- `sasha@example.com` — VP of product, offers mentorship (barter)
- `david@example.com` — startup founder, offers intros (has a sample
  completed request already in his history)
- `emily@example.com` — HR, offers resume review + mock interviews
- `admin@example.com` — flagged as a community admin, see `/admin`

Or sign up as a brand-new member from the signup form — you'll land in the
same network automatically.

### Using the real AI matching

Without `ANTHROPIC_API_KEY` set, parsing and ranking use a deterministic
keyword-based fallback (clearly flagged in the admin view). Set the key in
`.env` to use Claude for both steps — see `src/lib/claude.ts`.

## Deploying (get a real URL)

This gets you a live, shareable link. Total cost: $0 on the free tiers below.

**1. Create a free Postgres database.** [Neon](https://neon.tech) is the
easiest — sign up, create a project, and copy the connection string it
gives you (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb`).
Vercel Postgres and Supabase work the same way if you'd rather use one of
those.

**2. Push this repo to your own GitHub account** (skip if it's already
there — this branch already is).

**3. Import the repo into [Vercel](https://vercel.com).** Sign up with
GitHub, click "Add New... → Project", and select this repository. Vercel
auto-detects Next.js — you don't need to change any build settings.

**4. Set environment variables** in the Vercel project's Settings →
Environment Variables, before the first deploy (or redeploy after adding
them):
- `DATABASE_URL` — the Neon connection string from step 1
- `SESSION_SECRET` — any random 32+ character string
- `ANTHROPIC_API_KEY` — optional, but this is what turns on real Claude
  parsing/matching instead of the heuristic fallback

**5. Deploy.** Vercel's build runs `prisma migrate deploy && next build`
(already wired up in `package.json`), so the database schema is created
automatically on the first deploy — no manual migration step needed.

**6. Seed demo data (once).** Migrations run automatically, but seeding
doesn't, since you may not want demo accounts in a real deployment. To add
them: run `DATABASE_URL="<your Neon URL>" npx prisma db seed` from your own
machine (with this repo checked out and `npm install` run), pointing at
the same `DATABASE_URL` you set in Vercel. Or just sign up for real through
the deployed app's `/signup` page instead — seeding is optional.

That's it — Vercel gives you a `https://<project>.vercel.app` URL after the
first deploy, and every push to this branch redeploys it automatically.

**7. Point the real domain at it (optional).** If you own a domain (e.g.
`themobiapp.com`), go to the Vercel project's Settings → Domains, add it,
and Vercel shows you the DNS records to add at your registrar (usually an
`A` record for the apex domain and a `CNAME` for `www`). Propagation
usually takes a few minutes to a few hours. Vercel issues a free SSL
certificate for it automatically once DNS resolves.

## Project layout

```
prisma/schema.prisma       Data model (Relationship, SideHustle, profile type, capacity, AskCreditEntry, ...)
prisma/seed.ts             Demo community + members + sample requests (help + opportunity)
src/lib/claude.ts          Claude parsing + ranking, with heuristic fallback
src/lib/matching.ts        Orchestrates parse -> rank -> persist Request/Match; visibility + capacity filtering
src/lib/credit.ts          Reputation points ledger + badge tier logic
src/lib/askCredits.ts      Spendable ask-credit ledger: signup bonus, spend-on-ask, earn-by-helping, monthly refresh
src/lib/session.ts         iron-session cookie auth helpers
src/app/dashboard          Ask bar (Mobi), ask-credit balance, "requests for you", "your asks"
src/app/feed               Public community feed of open asks + volunteer-to-help
src/app/requests/[id]      Request detail: matches, accept/decline, thread, review
src/app/profile/[id]       Public profile: badge, offerings, relationships, side hustles, help history
src/app/profile/edit       Edit profile, offerings, relationships, side hustles, visibility/capacity
src/app/directory          Browsable member directory with search
src/app/admin              Admin view of all requests, AI parsing, match status (AI-matched vs. volunteered)
```

## Notes / known limitations (prototype scope)

- No payment processing — `compensation` (free / barter / tip / paid) is
  just a status field on each offering, and a Service Provider's
  `subscriptionStatus` is a self-service flag with no real billing behind
  it, as specified.
- Auth is intentionally minimal (email + password, no email verification,
  no password reset) — fine for a prototype, not for production.
- The admin view is scoped to the logged-in admin's own community.
- `npm audit` flags a couple of advisories in the pinned Next.js/PostCSS
  versions (mostly around `next/image` and custom-server deployments, which
  this prototype doesn't use); worth revisiting before any real deployment.
