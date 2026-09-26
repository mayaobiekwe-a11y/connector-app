import { Resend } from "resend";

// Same fallback pattern as claude.ts and matching's heuristic fallback: no
// RESEND_API_KEY means emails are silently skipped rather than breaking the
// app. In-app notifications (dashboard/feed) always work regardless.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Mobi <notifications@themobiapp.com>";
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
  requestId: string
) {
  await send(
    to,
    "Mobi thinks you can help with something",
    layout(
      `<p>Hi ${firstName(memberName)},</p>
       <p>Mobi matched you to a request from someone in your network:</p>
       <p style="font-style: italic; border-left: 3px solid #ddd6fe; padding-left: 12px;">"${requestText}"</p>
       <p>${reason}</p>`,
      `${APP_URL}/requests/${requestId}`,
      "View request"
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
