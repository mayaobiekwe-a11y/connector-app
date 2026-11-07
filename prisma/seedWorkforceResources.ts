import { prisma } from "../src/lib/db";
import { getDefaultCommunityId } from "../src/lib/community";

// Real workforce/career resources pulled from Nneka's "National Workforce
// Resource Guide." Run with: npx tsx prisma/seedWorkforceResources.ts
// Idempotent — safe to re-run; skips any resource that already exists by
// name within the community.
const RESOURCES: {
  name: string;
  description: string;
  url: string;
  phone?: string;
  categories: string[];
}[] = [
  {
    name: "American Job Centers",
    description:
      "Nearly 2,300 local centers funded by the U.S. Department of Labor. CareerOneStop helps you find the closest one. Job search help, training referrals, unemployment questions, free computers and resume workshops.",
    url: "https://www.careeronestop.org",
    phone: "1-877-872-5627",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Civic Match",
    description:
      "A free job platform for state and local government roles, run by the nonprofit Work for America. Started for displaced federal workers, now open to anyone interested in public service.",
    url: "https://workforamerica.org/civicmatch",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Apprenticeship.gov",
    description:
      "The Department of Labor's search for open apprenticeships. Paid, on-the-job training with a credential at the end. Search by career or location and apply straight to the employer.",
    url: "https://www.apprenticeship.gov/apprenticeship-job-finder",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Per Scholas",
    description:
      "A national nonprofit with tuition-free tech training and career coaching, about 29 campuses plus a remote option from anywhere in the country.",
    url: "https://perscholas.org/locations/",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Stellarworx",
    description:
      "A job matching platform from Opportunity@Work for people who built skills through work, the military, community college, or bootcamps instead of a four-year degree. Strongest in DC, the Bay Area, LA, and Houston.",
    url: "https://stellarworx.org/",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Virginia Has Jobs",
    description:
      "Virginia's job and training hub, run by Virginia Works. Launched for displaced federal workers, later added an AI Career Launch Pad built with Google (10,000 free Google scholarships).",
    url: "https://virginiahasjobs.com",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Maryland Public Servants Resource Website",
    description:
      "The governor's site for federal workers, contractors, and grantees affected by federal cuts. Unemployment insurance, health coverage, job search support, and legal resources on federal employment rules.",
    url: "https://response.maryland.gov/federalpublicservants/",
    categories: ["CAREER_SERVICES", "LEGAL"],
  },
  {
    name: "Pennsylvania fast-track hiring",
    description:
      "A 2025 executive order speeds up state hiring of former federal workers into funded vacancies. Roles in public safety, human services, and health care, posted on Civic Match.",
    url: "https://workforamerica.org/civicmatch",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "New York: You're Hired",
    description:
      "A state recruitment campaign inviting former federal workers to apply for New York government jobs. Aimed at filling 7,000+ open state positions, listed on StateJobsNY.",
    url: "https://ny.gov/wewantyou",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "My Career NJ",
    description:
      "New Jersey's online career hub. Career Navigator suggests jobs and paths based on your skills and history; Training Explorer compares programs, providers, and tuition help.",
    url: "https://mycareer.nj.gov",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "LAUNCH (Arkansas)",
    description:
      "Arkansas's free employment portal, puts job seekers, employers, and state workforce services in one place. AI matching based on skills, plus suggested training.",
    url: "https://jobseeker.launch.arkansas.gov/",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Free Google AI training (Massachusetts)",
    description:
      "A 2026 partnership between Massachusetts and Google giving every resident free access to the Google AI Professional Certificate and Career Certificates (cybersecurity, IT support, project management, UX, digital marketing).",
    url: "https://aihub.masstech.org/google-certificates",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Hawaii expedited hiring",
    description:
      "An executive order that speeds up state agency hiring for workers affected by federal firings or budget cuts.",
    url: "https://governor.hawaii.gov/newsroom/office-of-the-governor-news-release-gov-green-signs-executive-order-for-expedited-state-hiring/",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Talent Capital",
    description:
      "A free regional platform for DC, Maryland, and Virginia from the Metropolitan Washington Council of Governments, built by BuildWithin. 83,000+ active users, 65,000 full-time jobs, AI matching, training, and in-person hiring events.",
    url: "https://talentcapital.ai",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "Ready to Work (San Antonio)",
    description:
      "A San Antonio city program funded by a voter-approved sales tax through 2029. Training from short certificates to degree programs, job placement, and support like rental assistance.",
    url: "https://311.sanantonio.gov/kb/docs/faqs/sa-ready-to-work-program",
    phone: "210-224-4357",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "RVA Builds",
    description:
      "A skilled-trades program for Richmond Public Schools students, run by Richmond Ed Fund with Bloomberg Philanthropies funding. Paid work experience in electrical, HVAC, welding, and construction.",
    url: "https://www.constructionowners.com/news/buildwithin-named-technology-partner-for-richmonds-8-million-skilled-trades-apprenticeship-program",
    categories: ["CAREER_SERVICES"],
  },
  {
    name: "YSU Talent Marketplace",
    description:
      "Youngstown State University's regional program with Opportunity@Work, connecting Northeast Ohio workers without four-year degrees to local employers.",
    url: "https://ysu.edu/workforce/talentmarketplace",
    categories: ["CAREER_SERVICES"],
  },
];

async function main() {
  const communityId = await getDefaultCommunityId();
  let created = 0;
  let skipped = 0;

  for (const r of RESOURCES) {
    const existing = await prisma.resource.findFirst({
      where: { communityId, name: r.name },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.resource.create({
      data: {
        communityId,
        name: r.name,
        description: r.description,
        url: r.url,
        phone: r.phone,
        categories: r.categories,
      },
    });
    created++;
  }

  console.log(`Workforce resources: ${created} created, ${skipped} already present.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
