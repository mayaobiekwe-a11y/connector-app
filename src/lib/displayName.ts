// Members only ever see each other's first name — full names make it too
// easy to look someone up on LinkedIn and route around the platform
// entirely, which defeats the point of tracking asks/matches/reviews here.
// Admins are the one exception (moderation needs a real identity).
export function firstNameOnly(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}
