function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({
  name,
  avatarUrl,
  size = 48,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className="rounded-full object-cover border border-gray-200 shrink-0"
      />
    );
  }
  return (
    <div
      style={style}
      className="rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center shrink-0"
    >
      {initials(name) || "?"}
    </div>
  );
}
