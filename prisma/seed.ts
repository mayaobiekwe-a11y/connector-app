import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { HelpCategory, CompensationType, ProfileType } from "../src/lib/enums";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  const community = await prisma.community.upsert({
    where: { slug: "demo-network" },
    update: {},
    create: {
      name: "Riverside Alumni Network",
      slug: "demo-network",
      description: "A demo trusted network for the Connector prototype.",
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  type SeedMember = {
    name: string;
    email: string;
    title: string;
    company: string;
    industry: string;
    location: string;
    bio: string;
    linkedinUrl?: string;
    isAdmin?: boolean;
    openToRoles?: boolean;
    openToGigWork?: boolean;
    profileType?: ProfileType;
    monthlyCapacity?: number;
    offerings: { category: HelpCategory; compensation: CompensationType; notes?: string }[];
    relationships?: { label: string; notes?: string }[];
    sideHustles?: { name: string; description?: string; url?: string }[];
  };

  const members: SeedMember[] = [
    {
      name: "Jordan Ellis",
      email: "jordan@example.com",
      title: "Director of Data Strategy",
      company: "Meridian Health",
      industry: "Healthcare",
      location: "Washington, DC",
      bio: "10 years in healthcare data strategy at startups and hospital systems in the DC area. Happy to make intros or talk shop.",
      linkedinUrl: "https://linkedin.com/in/jordanellis",
      offerings: [
        { category: "INTRO_REFERRAL", compensation: "FREE", notes: "Can connect you to folks at DC-area health startups." },
        { category: "COFFEE_CHAT", compensation: "FREE" },
      ],
      relationships: [{ label: "Google Health", notes: "Former manager, still close." }],
    },
    {
      name: "Priya Nair",
      email: "priya@example.com",
      title: "Senior Policy Advisor",
      company: "Office of Public Health Policy",
      industry: "Public Policy",
      location: "Washington, DC",
      bio: "Worked in public policy for 8 years, focused on health and social policy. Enjoys mentoring people transitioning into policy work.",
      linkedinUrl: "https://linkedin.com/in/priyanair",
      openToRoles: true,
      offerings: [
        { category: "RESUME_REVIEW", compensation: "FREE" },
        { category: "MENTORSHIP", compensation: "FREE" },
      ],
      relationships: [{ label: "White House Domestic Policy Council", notes: "Former colleague." }],
    },
    {
      name: "Marcus Chen",
      email: "marcus@example.com",
      title: "Engineering Manager",
      company: "Bright Fintech",
      industry: "Fintech",
      location: "New York, NY",
      bio: "Leads a backend engineering team at a fintech startup. Loves doing mock interviews for engineers.",
      openToGigWork: true,
      profileType: "SERVICE_PROVIDER",
      monthlyCapacity: 5,
      offerings: [
        { category: "MOCK_INTERVIEW", compensation: "FREE" },
        { category: "PAID_CONSULTING", compensation: "PAID", notes: "1:1 career coaching for engineers, $75/session." },
      ],
      relationships: [{ label: "Stripe", notes: "Ex-teammate now on the infra team." }],
      // The day job pays the bills; the woodworking business is what he
      // actually wants to be known for — and a good match for anyone
      // asking about furniture-making, not engineering.
      sideHustles: [
        { name: "Chen Woodworks", description: "Custom furniture and woodworking, evenings and weekends." },
      ],
    },
    {
      name: "Sasha Ivanova",
      email: "sasha@example.com",
      title: "VP of Product",
      company: "Northwind Software",
      industry: "Technology",
      location: "Austin, TX",
      bio: "Product leader with a background in growth and B2B SaaS. Open to ongoing mentorship for aspiring PMs.",
      openToRoles: true,
      offerings: [
        { category: "MENTORSHIP", compensation: "BARTER", notes: "Open to a skills trade." },
        { category: "COFFEE_CHAT", compensation: "FREE" },
      ],
      relationships: [{ label: "Meta", notes: "Close friend on the product team." }],
      sideHustles: [{ name: "Firehouse Ceramics", description: "A small pottery studio she runs on weekends." }],
    },
    {
      name: "David Okafor",
      email: "david@example.com",
      title: "Founder & CEO",
      company: "Carewell Health Startup",
      industry: "Healthcare",
      location: "Washington, DC",
      bio: "Founder of an early-stage healthcare startup in DC, previously worked in hospital operations. Always looking for great talent and partners.",
      offerings: [
        { category: "INTRO_REFERRAL", compensation: "FREE" },
        { category: "PAID_CONSULTING", compensation: "TIP", notes: "Startup strategy sessions, tips appreciated." },
      ],
    },
    {
      name: "Emily Ramirez",
      email: "emily@example.com",
      title: "HR Business Partner",
      company: "Global Logistics Co",
      industry: "Logistics",
      location: "Chicago, IL",
      bio: "HR professional with a passion for helping career changers land their next role.",
      openToGigWork: true,
      offerings: [
        { category: "RESUME_REVIEW", compensation: "FREE" },
        { category: "MOCK_INTERVIEW", compensation: "FREE" },
      ],
      relationships: [{ label: "LinkedIn Talent Solutions", notes: "Runs recruiter workshops with them." }],
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      title: "Community Admin",
      company: "Riverside Alumni Network",
      industry: "Community Management",
      location: "Remote",
      bio: "Runs the Riverside Alumni Network.",
      isAdmin: true,
      offerings: [],
    },
  ];

  const created: Record<string, Awaited<ReturnType<typeof prisma.member.upsert>>> = {};
  for (const m of members) {
    const member = await prisma.member.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        passwordHash,
        name: m.name,
        title: m.title,
        company: m.company,
        industry: m.industry,
        location: m.location,
        bio: m.bio,
        linkedinUrl: m.linkedinUrl,
        isAdmin: m.isAdmin ?? false,
        openToRoles: m.openToRoles ?? false,
        openToGigWork: m.openToGigWork ?? false,
        profileType: m.profileType ?? "GENERAL",
        subscriptionStatus: m.profileType === "SERVICE_PROVIDER" ? "ACTIVE" : "NONE",
        monthlyCapacity: m.monthlyCapacity,
        communityId: community.id,
        offerings: {
          create: m.offerings.map((o) => ({
            category: o.category,
            compensation: o.compensation,
            notes: o.notes,
          })),
        },
        relationships: {
          create: (m.relationships ?? []).map((r) => ({ label: r.label, notes: r.notes })),
        },
        sideHustles: {
          create: (m.sideHustles ?? []).map((s) => ({ name: s.name, description: s.description, url: s.url })),
        },
      },
    });
    created[m.email] = member;
  }

  // A sample completed request to make the profile/admin/credit views feel real.
  const requester = created["david@example.com"];
  const helper = created["jordan@example.com"];

  const existingRequest = await prisma.request.findFirst({
    where: { requesterId: requester.id, rawText: { contains: "healthcare data" } },
  });

  if (!existingRequest) {
    const request = await prisma.request.create({
      data: {
        requesterId: requester.id,
        communityId: community.id,
        rawText: "Who in this group has a connection at a healthcare startup focused on data strategy?",
        status: "COMPLETED",
        parsedIndustry: "Healthcare",
        parsedFunction: "Data Strategy",
        parsedIntent: "BUSINESS_INTRO",
        parsedSummary: "Looking for a connection at a healthcare data-strategy startup.",
        parsedRaw: JSON.stringify({ seed: true }),
      },
    });

    const match = await prisma.match.create({
      data: {
        requestId: request.id,
        memberId: helper.id,
        rank: 1,
        score: 0.92,
        reason: "Jordan works in healthcare data strategy and has offered to help with intros.",
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    const thread = await prisma.thread.create({ data: { matchId: match.id } });
    await prisma.message.createMany({
      data: [
        { threadId: thread.id, senderId: requester.id, body: "Hi Jordan! Thanks for connecting — would love an intro if you have one." },
        { threadId: thread.id, senderId: helper.id, body: "Happy to help, I'll connect you with a couple of folks this week." },
      ],
    });

    await prisma.review.create({
      data: {
        requestId: request.id,
        matchId: match.id,
        reviewerId: requester.id,
        revieweeId: helper.id,
        outcome: "HELPED",
        rating: 5,
        comment: "Jordan made a great intro, exactly what I needed.",
      },
    });

    await prisma.creditEntry.create({
      data: { memberId: helper.id, points: 3, reason: "RESPONDED_TO_REQUEST", refId: match.id },
    });
    await prisma.creditEntry.create({
      data: { memberId: helper.id, points: 15, reason: "COMPLETED_POSITIVE", refId: match.id },
    });
  }

  // Sample opportunity-style requests (job opening + gig hiring) so the
  // new intents are visible without having to create them by hand.
  const sasha = created["sasha@example.com"];
  const marcus = created["marcus@example.com"];

  const existingJobOpening = await prisma.request.findFirst({
    where: { requesterId: requester.id, rawText: { contains: "hiring a Product Manager" } },
  });
  if (!existingJobOpening) {
    const jobRequest = await prisma.request.create({
      data: {
        requesterId: requester.id,
        communityId: community.id,
        rawText: "We're hiring a Product Manager for our health tech startup — know anyone great, or interested yourself?",
        status: "MATCHED",
        parsedIndustry: "Technology",
        parsedFunction: "Product Management",
        parsedIntent: "JOB_OPENING",
        parsedSummary: "Hiring a Product Manager; open to referrals or direct interest.",
        parsedRaw: JSON.stringify({ seed: true }),
      },
    });
    await prisma.match.create({
      data: {
        requestId: jobRequest.id,
        memberId: sasha.id,
        rank: 1,
        score: 0.81,
        reason: "Sasha is open to new roles and has relevant product leadership experience.",
        status: "PENDING",
      },
    });
  }

  const existingGigRequest = await prisma.request.findFirst({
    where: { requesterId: requester.id, rawText: { contains: "freelancer to help redesign" } },
  });
  if (!existingGigRequest) {
    const gigRequest = await prisma.request.create({
      data: {
        requesterId: requester.id,
        communityId: community.id,
        rawText: "I need a freelancer to help redesign our onboarding flow for a few weeks.",
        status: "MATCHED",
        parsedFunction: "Design",
        parsedIntent: "HIRING_GIG_WORK",
        parsedSummary: "Needs a freelance designer for a short-term onboarding redesign project.",
        parsedRaw: JSON.stringify({ seed: true }),
      },
    });
    await prisma.match.create({
      data: {
        requestId: gigRequest.id,
        memberId: marcus.id,
        rank: 1,
        score: 0.6,
        reason: "Marcus is open to gig/freelance work.",
        status: "PENDING",
      },
    });
  }

  console.log("Seed complete. Demo login: any member email above with password 'password123'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
