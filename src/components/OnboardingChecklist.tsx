import Link from "next/link";

// Signup only collects the account basics and relationships (see
// /signup); everything else lands here as bite-sized, optional follow-ups
// instead of blocking account creation. Hidden once everything's done.
export default function OnboardingChecklist({
  member,
}: {
  member: {
    title: string | null;
    industry: string | null;
    location: string | null;
    bio: string | null;
    needCategories: string[];
    linkedinUrl: string | null;
    avatarUrl: string | null;
  };
}) {
  const items = [
    {
      label: "Add your title, industry, location & a short bio",
      done: Boolean(member.title && member.industry && member.location && member.bio),
    },
    {
      label: "Tell us what you're hoping to find here",
      done: member.needCategories.length > 0,
    },
    {
      label: "Add a LinkedIn or photo so people recognize you",
      done: Boolean(member.linkedinUrl || member.avatarUrl),
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null;

  return (
    <Link href="/profile/edit" className="card p-4 block hover:border-brand-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Finish your profile</h2>
        <span className="text-xs text-gray-400">
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-brand-700 to-accent-500 rounded-full"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {items
          .filter((i) => !i.done)
          .map((i) => (
            <li key={i.label} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 shrink-0" />
              {i.label}
            </li>
          ))}
      </ul>
    </Link>
  );
}
