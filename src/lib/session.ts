import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { prisma } from "./db";

export interface SessionData {
  memberId?: string;
}

const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ?? "insecure-dev-only-secret-change-me-32ch",
  cookieName: "connector_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

// Full member record for the currently logged-in user, or null.
export async function getCurrentMember() {
  const session = await getSession();
  if (!session.memberId) return null;
  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: { community: true, offerings: true },
  });
  return member;
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) {
    throw new Error("UNAUTHENTICATED");
  }
  return member;
}
