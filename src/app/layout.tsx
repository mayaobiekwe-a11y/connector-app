import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Connector — warm intros from people who know you",
  description: "A trusted-network referral and mentorship matching prototype.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
