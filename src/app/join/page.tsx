import QuickJoinForm from "@/components/QuickJoinForm";

// Public landing page for the QR code shown at networking events (see
// /admin/qr). No login, no relationships required — just enough to follow
// up. An admin reviews and approves these before they show up anywhere
// (see /admin/leads).
export default function JoinPage() {
  return (
    <div className="max-w-sm mx-auto py-10 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Join Mobi's network</h1>
        <p className="mt-2 text-sm text-gray-600">
          Leave your name and email and we'll follow up with an invite to set up your profile.
        </p>
      </div>
      <QuickJoinForm />
    </div>
  );
}
