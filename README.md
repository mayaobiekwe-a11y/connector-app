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
- **Resend** — sends email notifications for new matches, thread messages,
  accepted/declined requests, and reviews. Optional: without a key, emails
  are silently skipped and everything still works via in-app notifications.
- **Tailwind CSS** — mobile-responsive UI. Brand palette is violet (`brand`,
  primary), terracotta (`accent`, opportunity/highlight callouts), and gold
  (`gold`, the top reputation tier) — defined in `tailwind.config.ts`. The
  logo (`src/components/Logo.tsx`, three overlapping circles in those same
  colors) is also exported standalone at `public/logo.svg` (full wordmark)
  and `public/logo-mark.svg` (icon only) for use outside the app.

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
   up in their dashboard's "Requests for you," and by email if Resend is
   configured — see below) — **and** the ask also
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
   nav bar. That track record now also feeds back into step 2: matching
   treats it as a tiebreaker, so someone who's proven they actually follow
   through outranks an equally "relevant" member who's never engaged — a
   listed relationship alone isn't enough. The top two tiers also get their
   own badge color (`badgeColorClasses` in `src/lib/badgeColors.ts`) —
   terracotta for Super Connector, gold for Highly Connected — so reaching
   them visibly stands out instead of every tier sharing the same purple
   pill. Separately, it also earns **ask credits** — see below.

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

At signup, members list places they have a **solid personal
relationship** — not necessarily their own employer (e.g. "Google" because
a close friend works there, or "DC policy circles"). **Signup requires at
least 2** (enforced client- and server-side); the point of a referral
network is the warm intros members can actually make, and a member with
zero relationships listed can't make any. On the profile-edit page,
adding more later is optional. A LinkedIn URL is also optional. When a
request names a company or industry, a member with a matching
relationship is usually the single best match for a warm intro, even if
their own job is unrelated — the match reason calls this out explicitly
(e.g. "Jordan doesn't work at Google but has a relationship there.").

### What are you hoping to find here?

At signup (and editable later), members check off what kind of support
they're hoping to find — mental health recommendations, healthcare
recommendations, career services, general networking, legal
recommendations, financial planning, business/entrepreneurship support,
mentorship, sexual assault support, workplace harassment support
(`NEED_CATEGORIES` in `src/lib/enums.ts`). It's a simple multi-select,
optional, not tied to any one request — more "what brought you here" than
an intake form. It's private: it's not shown on the public profile or
directory, only to the member themself and (via the database) admins —
the point for now is just capturing it, not acting on it automatically.

### Resources: orgs and hotlines that shouldn't wait on a warm intro

Some needs are urgent enough that routing them through "ask Mobi, wait to
get matched" is the wrong model entirely. `/admin/resources` lets an admin
curate a flat list of external orgs/hotlines (name, optional link, optional
phone, one or more categories from the same `NEED_CATEGORIES` list above —
e.g. a hotline can be tagged both Mental Health and Sexual Assault Support).
Every member sees them at `/resources`, grouped by category, with direct
`tel:`/external links — no request, no match, no waiting.

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
this is "profiles show in the group," made literal. A **Top connectors**
strip at the top of the page surfaces the five members with the most
reputation points, so showing up and following through is visibly
rewarded, not just something that happens quietly in the background. Two
things members control from their profile:
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

### Importing an existing community

A brand-new network is an empty directory, which is a bad first impression
if you're bringing in people who already know each other from somewhere
else (a Discord, an Airtable intake form, a spreadsheet of past members).
Admins can bulk-load that data from `/admin/import`:

1. **Upload a CSV** and map its columns to profile fields (name/email are
   required; title, company, industry, relationships, side hustles, etc.
   are optional). Rows whose email already exists are skipped, not
   overwritten.
2. Imported profiles show up in the directory and the AI matching pool
   immediately (`visibleInDirectory: true`) — so new joiners see a
   populated network on day one instead of an empty one — but each one has
   no password yet (`Member.passwordHash` is null) and can't log in. A
   small "Not yet on Mobi" badge marks these on the directory and profile
   pages so it's clear they haven't actually joined.
3. **Send claim invites** — a second button on the same page emails
   everyone imported-but-not-yet-invited a personal link
   (`/claim/[token]`) to set a password and activate their pre-loaded
   profile, without re-entering anything. Safe to click repeatedly; it
   only emails people who haven't already gotten an invite
   (`inviteSentAt`).
4. If an imported (unclaimed) member gets AI-matched to a request, their
   notification email points to the claim link instead of the request —
   so getting matched to something relevant becomes the reason they
   actually join.

### Quick-add at networking events (QR code)

For the moment someone's talking to you in person rather than filling out
a spreadsheet: `/admin/qr` shows a QR code pointing at `/join`, a public,
no-login page that just asks for a name, email, and an optional "where did
we meet" note. Unlike `/admin/import`, these don't show up in the
directory right away — they land in **`/admin/leads`** first
(`visibleInDirectory: false`) so an admin can approve real leads or
dismiss junk before anyone sees them. Approving a lead flips
`visibleInDirectory` to `true`, which also makes it eligible for the next
"Send claim invites" batch on the import page.

### Activation referral program

Every member's dashboard shows a personal invite link
(`/signup?ref=<memberId>`, in `src/components/InviteCard.tsx`). When
someone signs up through it and *activates* — posts their first ask,
accepts their first match, or volunteers for one, whichever happens first
— a `ReferralReward` row is created automatically for the person who
invited them (`maybeCreateReferralReward` in `src/lib/referrals.ts`,
called from the requests/respond/volunteer routes; idempotent, so it's
safe to call from all three). Capped at `MAX_REWARDS_PER_REFERRER` (5) per
referrer so it can't turn into spam-inviting — past the cap, the referral
link still attributes the signup, it just stops generating reward rows.

Nothing here processes a real payment, same pattern as `subscriptionStatus`
elsewhere in this schema: an admin reviews pending rewards at
`/admin/referrals`, actually sends the $10-15 gift card (or grants a free
month of a future premium tier) outside the app, and marks it rewarded
with an optional note on what was sent.

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
- `RESEND_API_KEY` — optional, turns on email notifications (new match,
  new message, accepted/declined, review received). Needs a domain
  verified in [Resend](https://resend.com).
- `EMAIL_FROM` — the "from" address for those emails, e.g.
  `Mobi <hello@themobiapp.com>`
- `APP_URL` — your live URL (e.g. `https://themobiapp.com`), used to build
  links inside emails

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
src/app/admin/import       Bulk CSV import + claim-invite sending for pre-loading an existing community
src/app/admin/qr           QR code for /join, for adding people on the spot at networking events
src/app/admin/leads        Review queue for quick-add leads before they hit the directory
src/app/admin/resources    Add/remove curated external orgs and hotlines
src/app/admin/referrals    Review and mark activation-referral rewards fulfilled
src/lib/referrals.ts       Referral attribution + reward trigger (maybeCreateReferralReward)
src/app/resources          Member-facing list of those resources, grouped by category
src/app/join               Public, no-login quick-add form the QR code points to
src/app/claim/[token]      Where an imported member sets a password and activates their profile
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
