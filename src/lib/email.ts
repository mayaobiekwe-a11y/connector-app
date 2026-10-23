import { Resend } from "resend";

// Same fallback pattern as claude.ts and matching's heuristic fallback: no
// RESEND_API_KEY means emails are silently skipped rather than breaking the
// app. In-app notifications (dashboard/feed) always work regardless.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Mobi <hello@themobiapp.com>";
const APP_URL = process.env.APP_URL || "https://themobiapp.com";

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function layout(bodyHtml: string, ctaHref: string, ctaLabel: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937; line-height: 1.5;">
      ${bodyHtml}
      <p style="margin-top: 20px;">
        <a href="${ctaHref}" style="display: inline-block; padding: 10px 20px; background: #6d28d9; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          ${ctaLabel}
        </a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">Sent by Mobi &mdash; themobiapp.com</p>
    </div>
  `;
}

async function send(to: string, subject: string, html: string) {
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export async function sendNewMatchEmail(
  to: string,
  memberName: string,
  requestText: string,
  reason: string,
  requestId: string,
  claimToken?: string | null
) {
  const unclaimed = Boolean(claimToken);
  await send(
    to,
    "Mobi thinks you can help with something",
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       <p>Mobi matched you to a request from someone in the network:</p>
       <p style="font-style: italic; border-left: 3px solid #ddd6fe; padding-left: 12px;">"${requestText}"</p>
       <p>${reason}</p>
       ${unclaimed ? `<p>You're not on Mobi yet. Claim your account to respond.</p>` : ""}`,
      unclaimed ? `${APP_URL}/claim/${claimToken}` : `${APP_URL}/requests/${requestId}`,
      unclaimed ? "Claim your account" : "View request"
    )
  );
}

export async function sendClaimInviteEmail(to: string, memberName: string, claimToken: string) {
  await send(
    to,
    "You're already on Mobi, claim your account",
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       <p>Your profile is already set up on Mobi, the network built to remember everyone
       and connect you to the right person when you need something specific.</p>
       <p>Claim your account to start asking, matching, and connecting.</p>`,
      `${APP_URL}/claim/${claimToken}`,
      "Claim your account"
    )
  );
}

export async function sendMatchRespondedEmail(
  to: string,
  memberName: string,
  responderName: string,
  accepted: boolean,
  requestId: string
) {
  await send(
    to,
    accepted ? `${firstName(responderName)} can help you` : "Update on your request",
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       <p>${firstName(responderName)} ${
        accepted ? "accepted your request and is ready to connect." : "isn't able to help with this one."
      }</p>`,
      `${APP_URL}/requests/${requestId}`,
      "View request"
    )
  );
}

export async function sendNewMessageEmail(to: string, memberName: string, senderName: string, requestId: string) {
  await send(
    to,
    `New message from ${firstName(senderName)}`,
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       <p>${firstName(senderName)} sent you a message on Mobi.</p>`,
      `${APP_URL}/requests/${requestId}`,
      "Read message"
    )
  );
}

export async function sendReviewReceivedEmail(
  to: string,
  memberName: string,
  rating: number | null,
  requestId: string
) {
  await send(
    to,
    "You got feedback on Mobi",
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       <p>${
         rating
           ? `You were rated ${rating}/5 for helping with a recent request.`
           : "Someone left an update on a request you helped with."
       }</p>`,
      `${APP_URL}/requests/${requestId}`,
      "View request"
    )
  );
}

export interface WeeklyDigestStats {
  newRequestsCount: number;
  newMembersCount: number;
  pendingMatchesCount: number;
}

function weeklyDigestSubject(stats: WeeklyDigestStats): string {
  if (stats.pendingMatchesCount > 0) {
    return `You have ${stats.pendingMatchesCount} request${stats.pendingMatchesCount === 1 ? "" : "s"} waiting on you`;
  }
  if (stats.newRequestsCount > 0) {
    return `${stats.newRequestsCount} new ask${stats.newRequestsCount === 1 ? "" : "s"} posted on Mobi this week`;
  }
  return "Your weekly Mobi roundup";
}

export async function sendWeeklyDigestEmail(to: string, memberName: string, stats: WeeklyDigestStats) {
  const lines: string[] = [];
  if (stats.pendingMatchesCount > 0) {
    lines.push(
      `<p><strong>${stats.pendingMatchesCount} request${
        stats.pendingMatchesCount === 1 ? " is" : "s are"
      } still waiting on your response.</strong> A quick accept or decline keeps the network moving.</p>`
    );
  }
  if (stats.newRequestsCount > 0) {
    lines.push(
      `<p><strong>${stats.newRequestsCount}</strong> new ask${
        stats.newRequestsCount === 1 ? "" : "s"
      } went out in the network this week. Someone in there might be exactly who you're looking for too.</p>`
    );
  }
  if (stats.newMembersCount > 0) {
    lines.push(
      `<p><strong>${stats.newMembersCount}</strong> new member${
        stats.newMembersCount === 1 ? "" : "s"
      } joined this week.</p>`
    );
  }

  await send(
    to,
    weeklyDigestSubject(stats),
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       ${lines.join("\n       ")}
       <p>Take a look and see who you can connect with.</p>`,
      `${APP_URL}/dashboard`,
      "Open Mobi"
    )
  );
}
