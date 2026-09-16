const COLORS: Record<string, string> = {
  OPEN: "bg-amber-50 text-amber-700 border-amber-200",
  MATCHED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
  DECLINED: "bg-gray-100 text-gray-500 border-gray-200",
  EXPIRED: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function StatusPill({ label, status }: { label: string; status: string }) {
  const color = COLORS[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return <span className={`badge border ${color}`}>{label}</span>;
}
