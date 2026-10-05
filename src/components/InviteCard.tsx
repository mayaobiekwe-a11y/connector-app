import CopyLinkButton from "./CopyLinkButton";

const APP_URL = process.env.APP_URL || "https://themobiapp.com";

export default function InviteCard({
  memberId,
  pendingCount,
  rewardedCount,
  capReached,
}: {
  memberId: string;
  pendingCount: number;
  rewardedCount: number;
  capReached: boolean;
}) {
  const link = `${APP_URL}/signup?ref=${memberId}`;

  return (
    <div className="card p-4 sm:p-5">
      <h2 className="font-semibold text-gray-900">Invite someone to Mobi</h2>
      <p className="text-sm text-gray-500 mt-1">
        When they join and post their first ask (or accept their first match), you get a reward —
        a $10-15 gift card, or a free month of a future premium tier.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="text-xs text-gray-500 truncate flex-1 bg-gray-50 border border-gray-100 rounded px-2 py-1.5">
          {link}
        </code>
        <CopyLinkButton link={link} />
      </div>
      {(pendingCount > 0 || rewardedCount > 0) && (
        <p className="text-xs text-gray-400 mt-2">
          {pendingCount > 0 && `${pendingCount} reward${pendingCount === 1 ? "" : "s"} pending`}
          {pendingCount > 0 && rewardedCount > 0 && " · "}
          {rewardedCount > 0 && `${rewardedCount} received`}
        </p>
      )}
      {capReached && (
        <p className="text-xs text-gray-400 mt-2">
          You've reached the referral reward cap for now — keep sharing, just no more rewards until
          it resets.
        </p>
      )}
    </div>
  );
}
