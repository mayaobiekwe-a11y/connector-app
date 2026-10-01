import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getCurrentMember } from "@/lib/session";
import CopyLinkButton from "@/components/CopyLinkButton";

const APP_URL = process.env.APP_URL || "https://themobiapp.com";
const JOIN_URL = `${APP_URL}/join`;

export default async function AdminQrPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const qrDataUrl = await QRCode.toDataURL(JOIN_URL, { width: 400, margin: 2 });

  return (
    <div className="max-w-sm mx-auto space-y-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Quick add</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pull this up when you're networking. Anyone who scans it can leave their name and email on
          the spot — no app, no login. They'll show up in Leads for you to review before they're added
          to the directory.
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="QR code to join Mobi's network" className="mx-auto rounded-xl border border-gray-200" />
      <div className="flex items-center justify-center gap-2">
        <code className="text-xs text-gray-500 truncate">{JOIN_URL}</code>
        <CopyLinkButton link={JOIN_URL} />
      </div>
    </div>
  );
}
